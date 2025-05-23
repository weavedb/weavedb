import { clone } from "ramda"

let tables = {}
const kv = (io, vec, fn) => {
  let s = {}
  let l = {}
  let i = 0
  let c = []
  let on = false
  const get = k => l[k] ?? s[k] ?? io.get(k) ?? null
  const put = (k, v) => (l[k] = v)
  const reset = () => {
    l = {}
  }
  const commit = async () => {
    if (c.length > 0) {
      on = true
      let count = 0
      let i, cl, from, to
      let opt = null
      let data = []
      let old = {}
      try {
        while (c.length > 0) {
          ;({ i, cl, opt } = c.shift())
          if (!from) from = i
          to = i
          try {
            const [op, ...query] = JSON.parse(opt.headers.query)
            const [dir] = query
            if (op === "createTable") {
              await vec.createTable(...query)
            } else if (op === "addData") {
              const table = tables[dir] ?? (await vec.openTable(dir))
              tables[dir] = table
              await table.add(query[1])
            }
          } catch (e) {
            console.log(e)
          }
          for (const k in cl ?? {}) {
            if (opt.delta) old[k] = io.get(k) ?? null
            if (cl[k] === null) io.remove(k)
            else io.put(k, cl[k])
            count++
          }
          data.push({ i, opt, cl })
          i++
        }
      } catch (e) {
        console.log(e)
      }
      fn?.({ from, to, count, len: c.length, data, old })
      await commit()
    }
    on = false
  }
  return {
    reset,
    commit: async (opt = {}) => {
      const cl = clone(l)
      c.push({ i, cl, opt })
      for (const k in cl ?? {}) s[k] = cl[k]
      reset()
      if (!on) commit(opt).then(() => {})
      return { i: i++, data: cl }
    },
    put,
    del: k => put(k, null),
    get,
    dump: () => ({ l, s }),
    add: async (dir, data) => {
      const table = tables[dir] ?? (await vec.openTable(dir))
      tables[dir] = table
      await table.add(data)
    },
    createTable: async (dir, data) =>
      await vec.createTable(dir, data, { mode: "overwrite" }),
    vectorSearch: async (dir, embeddings, limit) => {
      const table = tables[dir] ?? (await vec.openTable(dir))
      tables[dir] = table
      return await table.vectorSearch(embeddings).limit(limit).toArray()
    },
    query: async (dir, query) => {
      const table = tables[dir] ?? (await vec.openTable(dir))
      tables[dir] = table
      return await table.query().where(query).toArray()
    },
  }
}

export default kv
