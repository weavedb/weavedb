import { of } from "./monade.js"
import { pluck, isNil } from "ramda"
import { dir_schema } from "./schemas.js"
import { dirs_set } from "./rules.js"
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
  verifyNonce,
  setup,
} from "./ops.js"

const handlers = {
  get: args => of(args).map(init).to(getDocs),
  init: args => of(args).map(verifyNonce).map(setup).tap(commit),
  add: args =>
    of(args)
      .map(verifyNonce)
      .map(init)
      .map(setData)
      .map(auth)
      .tap(validateSchema)
      .map(getDocID)
      .map(putData)
      .tap(commit),
  set: args =>
    of(args)
      .map(verifyNonce)
      .map(init)
      .map(setData)
      .map(auth)
      .tap(validateSchema)
      .map(putData)
      .tap(commit),
  del: args =>
    of(args).map(verifyNonce).map(init).map(auth).map(delData).tap(commit),
  update: args =>
    of(args)
      .map(verifyNonce)
      .map(init)
      .map(updateData)
      .map(auth)
      .tap(validateSchema)
      .map(putData)
      .tap(commit),
  upsert: args =>
    of(args)
      .map(verifyNonce)
      .map(init)
      .map(upsertData)
      .map(auth)
      .tap(validateSchema)
      .map(putData)
      .tap(commit),
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
            const [op, ...q] = msg
            const sp = op.split(":")
            const _opt = last(q)
            let opt = __opt__
            if (_opt && typeof _opt === "object" && _opt["signature"])
              opt = { ...__opt__, ...q.pop() }
            let ctx = { op: sp[0], opname: op, opt }
            if (isNil(handlers[ctx.op]))
              throw Error(`handler doesn't exist: ${op}`)
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
