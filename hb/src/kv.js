import { clone } from "ramda"
const kv_base = (io, fn, sync, methods = {}) => {
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
      await io.transaction(() => {
        while (c.length > 0) {
          ;({ i, cl, opt } = c.shift())
          if (!from) from = i
          to = i
          for (const k in cl ?? {}) {
            if (opt.delta) old[k] = io.get(k) ?? null
            if (cl[k] === null) io.remove(k)
            else io.put(k, cl[k])
            count++
          }
          data.push({ i, opt, cl })
          i++
        }
      })
      fn?.({ from, to, count, len: c.length, data, old })
      await commit()
    }
    on = false
  }
  return {
    reset,
    commit: async (opt = {}) => {
      if (sync) sync(opt).then(() => {})
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
    ...methods,
  }
}

export default kv_base
