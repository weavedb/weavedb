import sql_parser from "node-sql-parser"
import { of, fn } from "./monade.js"
import { isNil } from "ramda"
import { last } from "ramda"
import { commit } from "./ops.js"
const parser = new sql_parser.Parser()
const handlers = {
  sql: args => of(args).tap(commit),
}

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
      set:
        (...msg) =>
        db => {
          try {
            try {
              const ast = parser.astify(msg[0], { database: "sqlite" })
              handlers.sql({
                db,
                q: msg[0],
                ctx: { opt: { ...last(msg), query: msg[0] } },
              })
              return db
            } catch (e) {
              throw e
            }
          } catch (e) {
            db.reset()
            throw e
          }
        },
    },
  })
  return monad
}

export default wdb
