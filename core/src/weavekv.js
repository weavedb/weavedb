import { filter, clone } from "ramda"
const kv = (io, fn, sync, methods = {}) => {
  let s = {}
  let l = {}
  const current = io.get(`__meta__/current`)
  let i = current ? current.i + 1 : 0
  let c = []
  let on = false
  const get = k => clone(l[k] ?? s[k] ?? io.get(k) ?? null)
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
      let info = null
      await io.transaction(() => {
        while (c.length > 0) {
          ;({ i, cl, opt, cb, state, info } = c.shift())
          if (!from) from = i
          to = i
          let pub_cl = {}
          let priv_cl = {}
          for (const k in cl ?? {}) {
            if (opt.delta) old[k] = io.get(k) ?? null
            if (cl[k] === null) io.remove(k)
            else io.put(k, cl[k])
            if ((k, /^__.*$/.test(k))) priv_cl[k] = cl[k]
            else pub_cl[k] = cl[k]
            count++
          }
          const __data = {
            i,
            opt,
            cl: pub_cl,
            ts: info?.ts,
            hashpath: info?.hashpath ?? null,
          }
          const __priv_data = { cl: priv_cl }
          data.push(__data)
          io.put(["__wal__", i], __data)
          io.put(["__priv_wal__", i], __data)
          io.put(`__meta__/current`, {
            i,
            ts: info?.ts,
            hashpath: state?.hashpath ?? null,
          })
          try {
            if (cb) cb(__data)
          } catch (e) {
            console.log(e)
          }
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
    commit: (opt = {}, cb, state, info) => {
      if (sync) sync(opt, { put, get, del }, state, info).then(() => {})
      const cl = clone(l)
      c.push({ i, cl, opt, cb, state, info })
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

export default kv
