import { of, fn } from "./monade.js"
import { last, isNil } from "ramda"

import normalize from "./dev_normalize.js"
import verify from "./dev_verify.js"
import write from "./dev_write_sql.js"
import parse from "./dev_parse_sql.js"

const wdb = (kv, __env__ = {}) => {
  const get = (dir, doc) => kv.get(`${dir}/${doc}`)
  const put = (dir, doc, data) => kv.put(`${dir}/${doc}`, data)
  const del = (dir, doc) => kv.del(`${dir}/${doc}`)
  const db = {
    get,
    put,
    del,
    dir: id => get("_", id),
    commit: opt => kv.commit(opt),
    reset: () => kv.reset(),
  }
  const monad = of(db, {
    to: {
      sql: q => db => {
        try {
          return __env__.sql.prepare(q).all()
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
            of(normalize(msg, kv, { ...__env__, ...env }))
              .map(verify)
              .map(parse)
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
