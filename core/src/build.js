import { pof, of, pka, ka, dev, pdev } from "monade"
import wkv from "./weavekv.js"
import { is } from "ramda"

const _store = _kv => {
  const get = (dir, doc) => _kv.get(`${dir}/${doc}`)
  const put = (dir, doc, data) => _kv.put(`${dir}/${doc}`, data)
  const del = (dir, doc) => _kv.del(`${dir}/${doc}`)
  const commit = (...params) => _kv.commit(...params)
  const reset = (...params) => _kv.reset(...params)
  return { ..._kv, get, put, del, commit, reset }
}

const _init = ({ kv, msg, opt }) => ({ state: {}, msg, env: { ...opt, kv } })

const build = ({ kv: kv_db, init = _init, store = _store, routes }) => {
  return (kv_custom, opt = {}) => {
    opt.branch ??= "main"
    const kv = kv_custom.init(kv_db)(wkv)
    let methods = {}
    const exec = (mon, dev) => (dev.__ka__ ? mon.chain(dev.fn()) : mon.map(dev))
    const iterate = (mon, devs) => devs.reduce((m, v) => match(m, v), mon)
    const match = (mon, v) =>
      is(Array, v)
        ? iterate(mon, v)
        : is(Function, v)
          ? exec(mon, v)
          : is(Object, v)
            ? checkout(mon, v)
            : mon

    const checkout = (mon, devs) => {
      const res = mon.val()
      const { state, env } = res
      return match(mon, devs[state.branch ?? env.branch ?? "main"])
    }

    const piterate = async (mon, devs) => {
      for (const v of devs) mon = await pmatch(mon, v)
      return mon
    }
    const pmatch = async (mon, v) =>
      is(Array, v)
        ? await piterate(mon, v)
        : is(Function, v)
          ? exec(mon, v)
          : is(Object, v)
            ? await pcheckout(mon, v)
            : mon

    const pcheckout = async (mon, devs) => {
      const res = await mon.val()
      const { state, env } = res
      return await pmatch(mon, devs[state.branch ?? env.branch ?? "main"])
    }

    const _of = (kv, msg, _opt) =>
      of({ kv, msg, opt: { ...opt, ..._opt } }).map(init)

    const _pof = (kv, msg, _opt, cb) =>
      pof({ kv, msg, opt: { ...opt, ..._opt, cb } }).map(init)

    for (const k in routes) {
      if (routes[k].async) {
        methods[k] = (...args) =>
          new Promise(async (res, rej) => {
            try {
              const m = await pmatch(_pof(...args, res), routes[k].devs)
              const _res = (await m.val()).state
              res(_res)
            } catch (e) {
              ;(console.log(e), kv.reset(), rej(e))
            }
          })
      } else {
        methods[k] = (...args) => {
          try {
            return match(_of(...args), routes[k].devs).val().state
          } catch (e) {
            ;(console.log(e), args[0].reset())
            throw e
          }
        }
      }
    }

    //const deviceCreator = async ? pdev(methods) : dev(methods)
    return pdev(methods)(store(kv))
  }
}

export default build
