import sql_parser from "node-sql-parser"
import { of, fn } from "./monade.js"
import { last, isNil } from "ramda"

import normalize from "./dev_normalize.js"
import verify from "./dev_verify.js"
import write from "./dev_write.js"

const parser = new sql_parser.Parser()

const wdb = (kv, __opt__ = {}) => {
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
      get: q => db => {
        try {
          return kv.sql(q)
        } catch (e) {
          throw e
        }
      },
    },
    map: {
      write:
        (msg, opt = {}) =>
        kv => {
          try {
            of(normalize(msg, kv, opt))
              .map(verify)
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
