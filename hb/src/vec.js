import sql_parser from "node-sql-parser"
import { of, fn } from "./monade.js"
import { isNil } from "ramda"
import { last, head, init } from "ramda"
import { commit } from "./ops.js"
const parser = new sql_parser.Parser()
const handlers = {
  vec: args => of(args).tap(commit),
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
      search:
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
      create:
        (...msg) =>
        db => {
          handlers.vec({
            db,
            q: [...init(msg)],
            ctx: { opt: { ...last(msg), query: init(msg), op: "createTable" } },
          })
          return db
        },
      add:
        (...msg) =>
        db => {
          handlers.vec({
            db,
            q: [...init(msg)],
            ctx: {
              opt: {
                ...last(msg),
                dir: head(msg),
                query: msg[1],
                op: "add",
              },
            },
          })
          return db
        },
    },
  })
  return monad
}

export default wdb
