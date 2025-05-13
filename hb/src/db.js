import { of, fn } from "./monade.js"
import { isNil } from "ramda"
import { last } from "ramda"
import {
  updateData,
  upsertData,
  validateSchema,
  putData,
  setData,
  delData,
  getDocID,
  commit,
  auth,
  init,
  getDocs,
  verify,
  setup,
  batch,
  add,
  set,
  del,
  update,
  upsert,
} from "./ops.js"

const handlers = {
  get: args => of(args).map(init).to(getDocs),
  init: args => of(args).map(verify).map(setup).tap(commit),
  add: args => of(args).map(verify).chain(add).tap(commit),
  set: args => of(args).map(verify).chain(set).tap(commit),
  del: args => of(args).map(verify).chain(del).tap(commit),
  update: args => of(args).map(verify).chain(update).tap(commit),
  upsert: args => of(args).map(verify).chain(upsert).tap(commit),
  batch: args => of(args).map(verify).map(batch).tap(commit),
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
      get:
        (...q) =>
        db => {
          try {
            let ctx = { op: "get" }
            return handlers.get({ db, q, ctx })
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
            const [opname, ...q] = msg
            const op = opname.split(":")[0]
            const _opt = last(q)
            let opt = __opt__
            if (_opt && typeof _opt === "object" && _opt["signature"])
              opt = { ...__opt__, ...q.pop() }
            let ctx = { op, opname, opt, ts: Date.now() }
            if (isNil(handlers[ctx.op]))
              throw Error(`handler doesn't exist: ${ctx.opname}`)
            handlers[ctx.op]({ db, q, ctx })
            return db
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
