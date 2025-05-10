import { of } from "./monade.js"
import { pluck, isNil } from "ramda"
import { dir_schema } from "./schemas.js"
import { dirs_set } from "../src/rules.js"
import { last } from "ramda"
import {
  updateData,
  upsertData,
  validateSchema,
  setData,
  delData,
  getDocID,
  commit,
  auth,
  init,
  getDocs,
  verifyNonce,
} from "./ops.js"

const handlers = {
  get: args => of(args).map(init).to(getDocs),
  add: args =>
    of(args)
      .map(verifyNonce)
      .map(init)
      .map(auth)
      .tap(validateSchema)
      .map(getDocID)
      .map(setData)
      .tap(commit),
  set: args =>
    of(args)
      .map(verifyNonce)
      .map(init)
      .map(auth)
      .tap(validateSchema)
      .map(setData)
      .tap(commit),
  del: args =>
    of(args).map(verifyNonce).map(init).map(auth).map(delData).tap(commit),
  update: args =>
    of(args)
      .map(verifyNonce)
      .map(init)
      .map(auth)
      .map(updateData)
      .tap(validateSchema)
      .map(setData)
      .tap(commit),
  upsert: args =>
    of(args)
      .map(verifyNonce)
      .map(init)
      .map(auth)
      .map(upsertData)
      .tap(validateSchema)
      .map(setData)
      .tap(commit),
}

const wdb = kv => {
  const get = (dir, doc) => kv.get(`${dir}/${doc}`)
  const put = (dir, doc, data) => kv.put(`${dir}/${doc}`, data)
  const del = (dir, doc) => kv.del(`${dir}/${doc}`)
  const db = {
    get,
    put,
    del,
    dir: id => get("__dirs__", id),
    commit: opt => kv.commit(opt),
    reset: () => kv.reset(),
  }
  if (isNil(db.dir("__dirs__"))) {
    db.put("__dirs__", "__dirs__", {
      index: 0,
      schema: dir_schema,
      auth: [dirs_set],
    })
    db.put("__dirs__", "__config__", {
      index: 1,
      schema: { type: "object", additionalProperties: false },
      auth: [],
    })
    db.put("__dirs__", "__indexes__", {
      index: 2,
      schema: { type: "object" },
      auth: [],
    })
    db.put("__dirs__", "__accounts__", {
      index: 3,
      schema: { type: "object" },
      auth: [],
    })
    db.commit()
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
      init: msg => db => {
        try {
          if (!isNil(db.get("__config__", "info")))
            throw Error("already initialized")
          db.put("__config__", "info", { id: msg.id, owner: msg.from })
          db.commit()
          return db
        } catch (e) {
          db.reset()
          throw Error(e)
        }
      },
      set:
        (...msg) =>
        db => {
          try {
            const [op, ...q] = msg
            const sp = op.split(":")
            const _opt = last(q)
            let opt = {}
            if (_opt && typeof _opt === "object" && _opt["signature"])
              opt = q.pop()
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
