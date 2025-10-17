import {
  pof,
  of,
  pka,
  ka,
  dev,
  pdev,
  flow,
  pflow,
} from "../../monade/src/index.js"
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
    let pmethods = {}

    const pred = (mon, devs) => {
      const { state, env } = mon.val()
      return devs[state.branch ?? env.branch ?? "main"]
    }

    const ppred = async (mon, devs) => {
      const { state, env } = await mon.val()
      return devs[state.branch ?? env.branch ?? "main"]
    }

    const _of = (kv, msg, _opt) =>
      of({ kv, msg, opt: { ...opt, ..._opt } }).map(init)

    const _pof = (kv, msg, _opt, cb) =>
      pof({ kv, msg, opt: { ...opt, ..._opt, cb } }).map(init)

    for (const k in routes) {
      if (routes[k].async) {
        pmethods[k] = (...args) => {
          return new Promise(async (res, rej) => {
            try {
              res(
                (
                  await _pof(...args, res)
                    .chain(pflow(routes[k].devs, ppred).k)
                    .val()
                ).state,
              )
            } catch (e) {
              ;(console.log(e), kv.reset(), rej(e))
            }
          })
        }
      } else {
        methods[k] = (...args) => {
          try {
            return _of(...args)
              .chain(flow(routes[k].devs, pred).k)
              .val().state
          } catch (e) {
            ;(console.log(e), args[0].reset())
            throw e
          }
        }
      }
    }
    const kv_store = store(kv)
    const db = dev(methods)
    const dbp = pdev(pmethods)
    const ops = {}
    for (const k in routes) {
      if (routes[k].async) {
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
