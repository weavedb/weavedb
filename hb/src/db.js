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
} from "./ops.js"

const handlers = {
  get: args => of(args).map(init).to(getDocs),
  add: args =>
    of(args)
      .map(init)
      .map(auth)
      .tap(validateSchema)
      .map(getDocID)
      .map(setData)
      .tap(commit),
  set: args =>
    of(args).map(init).map(auth).tap(validateSchema).map(setData).tap(commit),
  del: args => of(args).map(init).map(auth).map(delData).tap(commit),
  update: args =>
    of(args)
      .map(init)
      .map(auth)
      .map(updateData)
      .tap(validateSchema)
      .map(setData)
      .tap(commit),
  upsert: args =>
    of(args)
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
    dir: id => get(0, id),
    commit: opt => kv.commit(opt),
    reset: () => kv.reset(),
  }
  if (isNil(db.dir(0))) {
    db.put(0, "0", {
      name: "__dirs__",
      schema: dir_schema,
      auth: [dirs_set],
    })
    db.put(0, "1", {
      name: "__config__",
      schema: { type: "object", additionalProperties: false },
    })
    db.put(0, "2", {
      name: "__indexes__",
      schema: { type: "object" },
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
          if (!isNil(db.get(1, "info"))) throw Error("already initialized")
          db.put(1, "info", { id: msg.id, owner: msg.from })
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
