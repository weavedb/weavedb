import { pof, of, pka, ka, dev, pdev, flow, pflow } from "monade"
import wkv from "./weavekv.js"

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
    const _routes = routes[opt.branch]
    const kv = kv_custom.init(kv_db)(wkv)
    let methods = {}
    let pmethods = {}

    const pred = (mon, devs) => {
      const { state, env } = mon.val()
      return devs[state.branch ?? env.branch ?? "main"]
    }

    const ppred = async (mon, devs) => {
      const { state, env } = await mon.val()
      return devs[state.branch ?? env.branch ?? "main"]
    }

    for (const k in _routes) {
      if (_routes[k].async) {
        pmethods[k] = (kv, msg, _opt, cb) => {
          return new Promise(async (res, rej) => {
            try {
              res(
                (
                  await pof({ kv, msg, opt: { ...opt, ..._opt, cb } })
                    .map(init)
                    .chain(pflow(_routes[k].devs, ppred).k)
                    .val()
                ).state,
              )
            } catch (e) {
              ;(console.log(e), kv.reset(), rej(e))
            }
          })
        }
      } else {
        methods[k] = (kv, msg, _opt) => {
          try {
            return of({ kv, msg, opt: { ...opt, ..._opt } })
              .map(init)
              .chain(flow(_routes[k].devs, pred).k)
              .val().state
          } catch (e) {
            ;(console.log(e), kv.reset())
            throw e
          }
        }
      }
    }
    const kv_store = store(kv)
    const db = dev(methods)
    const dbp = pdev(pmethods)
    const ops = {}
    for (const k in _routes) {
      if (_routes[k].async) {
        ops[k] = async (...args) =>
          await dbp()
            [k](...args)
            .k(kv_store)
            .val()
      } else {
        ops[k] = (...args) =>
          db()
            [k](...args)
            .k(kv_store)
            .val()
      }
    }
    return ops
  }
}

export default build
