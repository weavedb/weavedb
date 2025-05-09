import { clone } from "ramda"

const kv = (io, fn) => {
  let s = {}
  let l = {}
  let i = 1
  let c = []
  let on = false
  const get = k => l[k] ?? s[k] ?? io.get(k) ?? null
  const put = (k, v) => (l[k] = v)
  const reset = () => (l = {})
  const commit = async () => {
    if (c.length > 0) {
      on = true
      let count = 0
      let i, cl, from, to
      await io.transaction(() => {
        while (c.length > 0) {
          ;({ i, cl } = c.shift())
          if (!from) from = i
          to = i
          for (const k in cl ?? {}) {
            if (cl[k] === null) io.remove(k)
            else io.put(k, cl[k])
            count++
          }
        }
      })
      fn?.({ from, to, count, len: c.length })
      await commit()
    }
    on = false
  }
  return {
    reset,
    commit: async () => {
      const cl = clone(l)
      c.push({ i, cl })
      for (const k in cl ?? {}) s[k] = cl[k]
      reset()
      if (!on) commit().then(() => {})
      return { i: i++, data: cl }
    },
    put,
    del: k => put(k, null),
    get,
    dump: () => ({ l, s }),
  }
}

export default kv
