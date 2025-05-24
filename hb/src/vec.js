import { of, pof, fn } from "./monade.js"
import { isNil } from "ramda"
import { last, head, init } from "ramda"
import normalize from "./dev_normalize.js"
import verify from "./dev_verify.js"
import write from "./dev_write_vec.js"
import parse from "./dev_parse_vec.js"

const wdb = (kv, __env__ = {}) => {
  const get = (dir, doc) => kv.get(`${dir}/${doc}`)
  const put = (dir, doc, data) => kv.put(`${dir}/${doc}`, data)
  const del = (dir, doc) => kv.del(`${dir}/${doc}`)
  const db = {
    get,
    put,
    del,
    dir: id => get("_", id),
    commit: (...opt) => kv.commit(...opt),
    reset: (opt = {}) => kv.reset(opt),
  }
  const _write = (msg, kv, env) => {
    of(normalize(msg, kv, env))
      .map(verify)
      .map(parse)
      .map(write)
  }
  const monad = pof(db, {
    to: {
      search:
        (...q) =>
        db => {
          try {
            return kv.search(...q)
          } catch (e) {
            throw e
          }
        },
      vectorSearch:
        (...q) =>
        db => {
          try {
            return kv.vectorSearch(...q)
          } catch (e) {
            throw e
          }
        },
      query:
        (...q) =>
        db => {
          try {
            return kv.query(...q)
          } catch (e) {
            throw e
          }
        },
    },
    map: {
      write:
        (msg, env = {}) =>
        kv => {
          try {
            _write(msg, kv, { ...__env__, ...env })
            return kv
          } catch (e) {
            kv.reset(env.cb)
            throw e
          }
        },
      pwrite:
        (msg, env = {}) =>
        kv =>
          new Promise(async (cb, rej) => {
            try {
              _write(msg, kv, {
                ...__env__,
                ...env,
                cb: () => {
                  cb(kv)
                },
              })
            } catch (e) {
              console.log(e)
              kv.reset()
              rej(e)
            }
          }),
    },
  })
  return monad
}

export default wdb
