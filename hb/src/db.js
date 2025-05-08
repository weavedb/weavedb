import { of } from "./monade.js"
import { isNil } from "ramda"
import { dir_schema } from "./schemas.js"
import { dirs_set } from "../src/rules.js"
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
} from "./ops.js"

import lsjson from "../src/lsjson.js"

const handlers = {
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

const wdb = (db, kv) => {
  db = kv ? lsjson([], { kv }) : (db ?? [])
  if (db.length === 0) {
    db.push({
      0: {
        name: "__dirs__",
        schema: dir_schema,
        auth: [dirs_set],
      },
      1: {
        name: "__config__",
        schema: { type: "object", additionalProperties: false },
      },
      2: {
        name: "__indexes__",
        schema: { type: "object" },
      },
    })
  }
  return of(db, {
    to: {
      get:
        (...q) =>
        db => {
          const [dir, doc] = q
          if (isNil(db[0][dir])) throw Error("dir doesn't exist")
          return doc ? (db[dir][doc] ?? null) : db[dir]
        },
    },
    map: {
      init: msg => db => {
        try {
          if (!isNil(db[1])) throw Error("already initialized")
          db[1] = { info: { id: msg.id, owner: msg.from } }
          db[2] = {}
          return db
        } catch (e) {
          db.$reset()
          throw Error(e)
        }
      },
      set:
        (...msg) =>
        db => {
          try {
            const [op, ...q] = msg
            const sp = op.split(":")
            let ctx = { op: sp[0], opname: op }
            if (isNil(handlers[ctx.op]))
              throw Error(`handler doesn't exist: ${op}`)
            handlers[ctx.op]({ db, q, ctx })
            return db
          } catch (e) {
            console.log(e)
            console.log(db[0], msg)
            db.$reset?.()
            throw Error(e)
          }
        },
    },
  })
}

export default wdb
