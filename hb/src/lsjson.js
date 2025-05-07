function lsjson(obj = {}, opts = {}, path = []) {
  const isRoot = path.length === 0
  const { kv = null, depth = 2 } = opts
  if (isRoot && !opts.state) {
    const state = {
      tx: 0,
      block: 0,
      wal: [],
      blocks: [],
      children: {},
    }
    if (kv) {
      const raw = kv.get("state")
      if (raw) {
        state.tx = raw.tx ?? 0
        state.block = raw.block ?? 0
      }
    }
    opts.state = state

    if (kv) {
      const rootKey = "children/"
      const topChildren = kv.get(rootKey) || []
      state.children[rootKey] = topChildren
      for (const child of topChildren) {
        const val = kv.get("db/" + child)
        if (val !== undefined) {
          obj[child] = val
        }
      }
    }
  }

  const state = opts.state

  const pathKey = (prefix, parts) =>
    prefix + "/" + (parts.length ? parts.join("/") : "")
  const fire = fn => Promise.resolve().then(fn).catch(console.error)

  const saveState = () => {
    if (kv) fire(() => kv.put("state", { tx: state.tx, block: state.block }))
  }
  const flushWal = (tx, entry) => {
    if (kv) fire(() => kv.put(pathKey("wal", [tx]), entry))
  }
  const flushBlock = (b, slice) => {
    if (kv) fire(() => kv.put(pathKey("blocks", [b]), slice))
  }
  const flushDoc = docPath => {
    if (!kv || docPath.length > depth) return
    let cur = obj
    for (const p of docPath) {
      cur = cur?.[p]
      if (cur == null) return
    }
    fire(() => kv.put(pathKey("db", docPath), cur))
  }
  const flushChildren = parentPath => {
    if (!kv) return
    const key = pathKey("children", parentPath)
    const arr = state.children[key] || []
    fire(() => kv.put(key, arr))
  }

  const getWalEntry = tx => (kv ? kv.get(pathKey("wal", [tx])) : undefined)
  const getBlock = b => (kv ? kv.get(pathKey("blocks", [b])) || [] : [])

  const replayToMemory = tgt => {
    Object.keys(obj).forEach(k => delete obj[k])
    for (let b = 1; b <= tgt; b++) {
      const slice = getBlock(b)
      for (const { op, path: pth, to } of slice) {
        let cur = obj
        for (let i = 0; i < pth.length - 1; i++) {
          const k = pth[i]
          if (!(k in cur)) cur[k] = {}
          cur = cur[k]
        }
        const last = pth[pth.length - 1]
        if (op === "set") cur[last] = to
        else if (op === "delete") delete cur[last]
      }
    }
    if (kv && isRoot) {
      const rootKey = "children/"
      const topChildren = kv.get(rootKey) || []
      state.children[rootKey] = topChildren
      for (const child of topChildren) {
        if (!(child in obj)) {
          const val = kv.get("db/" + child)
          if (val !== undefined) obj[child] = val
        }
      }
    }
  }

  const loadFromKV = fullPath =>
    kv ? kv.get("db/" + fullPath.join("/")) : undefined
  const loadChildren = parentPath => {
    const key = "children/" + parentPath.join("/")
    if (state.children[key]) return state.children[key]
    const arr = kv ? kv.get(key) || [] : []
    state.children[key] = arr
    return arr
  }

  const wrap = (v, pth) => {
    if (v && typeof v === "object") {
      return lsjson(v, opts, pth)
    }
    return v
  }

  return new Proxy(obj, {
    get(target, prop, receiver) {
      if (prop === "__isProxy") return true

      if (isRoot) {
        if (prop === "$tx") return state.tx
        if (prop === "$block") return state.block
        if (prop === "$wal")
          return (s = 0, e = state.tx + 1) => {
            const o = []
            for (let i = s; i < e; i++) {
              const v = getWalEntry(i)
              if (v) o.push(v)
            }
            return o
          }
        if (prop === "$blocks")
          return (s = 1, e = state.block + 1) => {
            const o = []
            for (let i = s; i < e; i++) {
              const v = getBlock(i)
              if (v.length) o.push({ id: i, wal: v })
            }
            return o
          }
        if (prop === "$commit") {
          return () => {
            const prev = state.blocks.at(-1)?.end ?? -1
            const start = prev + 1,
              end = state.wal.length - 1
            const slice = state.wal.slice(start, end + 1)
            state.block++
            state.blocks.push({ id: state.block, tx: state.tx, start, end })
            flushBlock(state.block, slice)
            saveState()
            const paths = new Set(
              slice.map(e => e.path.slice(0, depth).join("/")),
            )
            for (const p of paths) {
              const arr = p.split("/")
              flushDoc(arr)
              const parent = arr.slice(0, -1)
              const key = arr[arr.length - 1]
              const ck = "children/" + parent.join("/")
              const childArr = state.children[ck] || loadChildren(parent)
              if (!childArr.includes(key)) {
                childArr.push(key)
                flushChildren(parent)
              }
            }
          }
        }
        if (prop === "$reset") {
          return tgt => {
            const tb = tgt === undefined ? state.block : tgt
            if (tb < 0 || tb > state.block) throw Error("Invalid block")
            replayToMemory(tb)
            const vb = state.blocks.filter(b => b.id <= tb)
            const lb = vb.at(-1)
            state.wal.length = lb ? lb.end + 1 : 0
            state.blocks = vb
            state.block = tb
            state.tx = lb ? lb.tx : 0
            saveState()
          }
        }
      }

      if (!(prop in target) && kv && path.length < depth && prop !== "then") {
        const full = [...path, prop]
        const childrenArr = loadChildren(path)
        if (childrenArr.includes(prop)) {
          const val = loadFromKV(full)
          if (val !== undefined) {
            target[prop] = wrap(val, full)
          }
        }
      }

      const v = Reflect.get(target, prop, receiver)
      return wrap(v, [...path, prop])
    },

    set(target, prop, value, receiver) {
      const full = [...path, prop]
      const old = Reflect.get(target, prop, receiver)
      const ok = Reflect.set(target, prop, value, receiver)
      if (ok) {
        state.tx++
        const entry = {
          op: "set",
          tx: state.tx,
          path: full,
          from: old,
          to: value,
        }
        state.wal.push(entry)
        flushWal(state.tx, entry)
        if (path.length < depth) {
          const parentKey = "children/" + path.join("/")
          const childArr = state.children[parentKey] || loadChildren(path)
          if (!childArr.includes(prop)) {
            childArr.push(prop)
            flushChildren(path)
          }
          flushDoc(full)
        }
      }
      return ok
    },

    deleteProperty(target, prop) {
      const full = [...path, prop]
      const old = Reflect.get(target, prop)
      const ok = Reflect.deleteProperty(target, prop)
      if (ok) {
        state.tx++
        const entry = {
          op: "delete",
          tx: state.tx,
          path: full,
          from: old,
          to: undefined,
        }
        state.wal.push(entry)
        flushWal(state.tx, entry)
        if (path.length < depth) {
          const parentKey = "children/" + path.join("/")
          const childArr = state.children[parentKey] || loadChildren(path)
          const idx = childArr.indexOf(prop)
          if (idx !== -1) {
            childArr.splice(idx, 1)
            flushChildren(path)
          }
          fire(() => kv.remove(pathKey("db", full)))
        }
      }
      return ok
    },

    has(target, prop) {
      if (prop in target) return true
      if (kv && path.length < depth) {
        const arr = loadChildren(path)
        return arr.includes(prop)
      }
      return false
    },

    ownKeys(target) {
      const keys = new Set(Reflect.ownKeys(target))
      if (kv && path.length < depth) {
        const arr = loadChildren(path)
        arr.forEach(k => keys.add(k))
      }
      return [...keys]
    },

    getOwnPropertyDescriptor(target, prop) {
      if (prop in target) return Reflect.getOwnPropertyDescriptor(target, prop)
      if (kv && path.length < depth) {
        const arr = loadChildren(path)
        if (arr.includes(prop)) {
          const val = loadFromKV([...path, prop])
          return {
            configurable: true,
            enumerable: true,
            writable: true,
            value: wrap(val, [...path, prop]),
          }
        }
      }
      return undefined
    },
  })
}
export default lsjson
