function lsjson(obj = {}, opts = {}, path = []) {
  const isRoot = path.length === 0
  const { kv = null, depth = 2 } = opts

  if (isRoot && !opts.state) {
    const state = {
      tx: 0,
      block: 0,
      wal: [],
      blocks: [],
    }
    if (kv) {
      const raw = kv.get("state")
      if (raw) {
        state.tx = raw.tx ?? 0
        state.block = raw.block ?? 0
      }
    }
    opts.state = state
  }

  const state = opts.state

  const pathKey = (prefix, pathArr) => prefix + "/" + pathArr.join("/")

  const fireAndForget = fn => Promise.resolve().then(fn).catch(console.error)

  const saveState = () => {
    if (kv)
      fireAndForget(() => kv.put("state", { tx: state.tx, block: state.block }))
  }

  const flushDoc = docPath => {
    if (kv && docPath.length === depth) {
      let cursor = obj
      for (let i = 0; i < docPath.length; i++) {
        cursor = cursor?.[docPath[i]]
        if (cursor == null) return
      }
      fireAndForget(() => kv.put(pathKey("db", docPath), cursor))
    }
  }

  const flushBlock = (blockID, walSlice) => {
    if (kv) fireAndForget(() => kv.put(pathKey("blocks", [blockID]), walSlice))
  }

  const flushWal = (txID, entry) => {
    if (kv) fireAndForget(() => kv.put(pathKey("wal", [txID]), entry))
  }

  const getBlock = blockID =>
    state.blocks[blockID] ??
    (kv ? kv.get(pathKey("blocks", [blockID])) : undefined)

  const getWalEntry = txID =>
    state.wal[txID] ?? (kv ? kv.get(pathKey("wal", [txID])) : undefined)

  const replayToMemory = targetBlock => {
    for (const k of Object.keys(obj)) delete obj[k]
    for (let i = 1; i <= targetBlock; i++) {
      const wal = getBlock(i)
      for (const { op, path, to } of wal) {
        let cursor = obj
        for (let j = 0; j < path.length - 1; j++) {
          const k = path[j]
          if (!(k in cursor)) cursor[k] = {}
          cursor = cursor[k]
        }
        const key = path.at(-1)
        if (op === "set") cursor[key] = to
        else if (op === "delete") delete cursor[key]
      }
    }
  }

  return new Proxy(obj, {
    get(target, prop, receiver) {
      if (!isRoot) return Reflect.get(target, prop, receiver)

      if (prop === "$tx") return state.tx
      if (prop === "$block") return state.block

      if (prop === "$wal") {
        return (start = 0, end = state.tx + 1) => {
          const out = []
          for (let i = start; i < end; i++) {
            const val = getWalEntry(i)
            if (val) out.push(val)
          }
          return out
        }
      }

      if (prop === "$blocks") {
        return (start = 1, end = state.block + 1) => {
          const out = []
          for (let i = start; i < end; i++) {
            const val = getBlock(i)
            if (val.length > 0) out.push({ id: i, wal: val })
          }
          return out
        }
      }

      if (prop === "$commit") {
        return () => {
          const prevEnd = state.blocks.at(-1)?.end ?? -1
          const start = prevEnd + 1
          const end = state.wal.length - 1
          const walSlice = state.wal.slice(start, end + 1)

          state.block += 1
          state.blocks.push({ id: state.block, tx: state.tx, start, end })

          flushBlock(state.block, walSlice)
          saveState()

          const paths = new Set(
            walSlice.map(({ path }) => path.slice(0, depth).join("/")),
          )
          for (const p of paths) flushDoc(p.split("/"))
        }
      }

      if (prop === "$reset") {
        return (targetBlock = state.block) => {
          if (targetBlock < 0 || targetBlock > state.block)
            throw new Error("Invalid block ID: " + targetBlock)
          replayToMemory(targetBlock)

          const validBlocks = state.blocks.filter(b => b.id <= targetBlock)
          const lastBlock = validBlocks.at(-1)
          state.wal.length = lastBlock?.end + 1 ?? 0
          state.blocks = validBlocks
          state.block = targetBlock
          state.tx = lastBlock?.tx ?? 0
          saveState()
        }
      }

      const value = Reflect.get(target, prop, receiver)
      if (typeof value === "object" && value !== null) {
        return lsjson(value, opts, [...path, prop])
      }
      return value
    },

    set(target, prop, value, receiver) {
      const fullPath = [...path, prop]
      const oldVal = Reflect.get(target, prop, receiver)
      const success = Reflect.set(target, prop, value, receiver)
      if (success) {
        state.tx += 1
        const entry = {
          op: "set",
          tx: state.tx,
          path: fullPath,
          from: oldVal,
          to: value,
        }
        state.wal.push(entry)
        flushWal(state.tx, entry)
      }
      return success
    },

    deleteProperty(target, prop) {
      const fullPath = [...path, prop]
      const oldVal = Reflect.get(target, prop)
      const success = Reflect.deleteProperty(target, prop)
      if (success) {
        state.tx += 1
        const entry = {
          op: "delete",
          tx: state.tx,
          path: fullPath,
          from: oldVal,
          to: undefined,
        }
        state.wal.push(entry)
        flushWal(state.tx, entry)
      }
      return success
    },
  })
}

export default lsjson
