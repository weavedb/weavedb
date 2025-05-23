import { of, fn } from "./monade.js"
import { last, includes, isNil } from "ramda"

import normalize from "./dev_normalize.js"
import verify from "./dev_verify.js"
import parse from "./dev_parse.js"
import auth from "./dev_auth.js"
import write from "./dev_write.js"
import read from "./dev_read.js"

const wdb = (_kv, __env__ = {}) => {
  const get = (dir, doc) => _kv.get(`${dir}/${doc}`)
  const put = (dir, doc, data) => _kv.put(`${dir}/${doc}`, data)
  const del = (dir, doc) => _kv.del(`${dir}/${doc}`)

  const kv = {
    get,
    put,
    del,
    dir: id => get("_", id),
    commit: opt => _kv.commit(opt),
    reset: () => _kv.reset(),
  }

  const _get =
    opcode =>
    (...q) =>
    db => {
      try {
        return of({
          state: { opcode, query: ["get", ...q] },
          msg: null,
          env: { kv, ...__env__ },
        })
          .map(parse)
          .to(read)
      } catch (e) {
        throw e
      }
    }

  const monad = of(kv, {
    to: {
      read: msg => db => {
        try {
          return of(normalize(msg, kv)).map(parse).to(read)
        } catch (e) {
          throw e
        }
      },
      get: _get("get"),
      cget: _get("cget"),
    },
    map: {
      write:
        (msg, env = {}) =>
        kv => {
          try {
            of(normalize(msg, kv, { ...__env__, ...env }))
              .map(verify)
              .map(parse)
              .map(auth)
              .map(write)
            return kv
          } catch (e) {
            kv.reset()
            throw e
          }
        },
    },
  })
  return monad
}

export default wdb
