import { clone } from "ramda"
const kv_base = (io, fn, sync, methods = {}) => {
  let s = {}
  let l = {}
  let i = 0
  let c = []
  let on = false
  const get = k => l[k] ?? s[k] ?? io.get(k) ?? null
  const put = (k, v) => (l[k] = v)
  const del = k => put(k, null)
  const reset = cb => {
    l = {}
    if (cb) cb()
  }
  const commit = async () => {
    if (c.length > 0) {
      on = true
      let count = 0
      let i, cl, from, to
      let opt = null
      let data = []
      let old = {}
      let cb = null
      let state = null
      await io.transaction(() => {
        while (c.length > 0) {
          ;({ i, cl, opt, cb, state } = c.shift())
          if (!from) from = i
          to = i
          for (const k in cl ?? {}) {
            if (opt.delta) old[k] = io.get(k) ?? null
            if (cl[k] === null) io.remove(k)
            else io.put(k, cl[k])
            count++
          }
          const __data = { i, opt, cl, hashpath: state?.hashpath ?? null }
          data.push(__data)
          io.put(["__wal__", i], __data)
          io.put(`__meta__/current`, { i, hashpath: state?.hashpath ?? null })
          if (cb) cb()
          i++
        }
      })
      fn?.({ from, to, count, len: c.length, data, old })
      await commit()
    }
    on = false
  }
  return {
    io,
    reset,
    commit: async (opt = {}, cb, state) => {
      if (sync) await sync(opt, { put, get, del }, state).then(() => {})
      const cl = clone(l)
      c.push({ i, cl, opt, cb, state })
      for (const k in cl ?? {}) s[k] = cl[k]
      reset()
      if (!on) commit().then(() => {})
      return { i: i++, data: cl }
    },
    put,
    del,
    get,
    dump: () => ({ l, s }),
    ...methods,
  }
}

export default kv_base
