import { of } from "./monade.js"
import { dir_schema } from "./schemas.js"
import { isNil } from "ramda"

import {
  updateData,
  upsertData,
  validateSchema,
  setData,
  delData,
  getDocID,
} from "./ops.js"

const handlers = {
  add: (db, q) => of({ db, q }).tap(validateSchema).map(getDocID).map(setData),
  set: (db, q) => of({ db, q }).tap(validateSchema).map(setData),
  del: (db, q) => of({ db, q }).map(delData),
  update: (db, q) =>
    of({ db, q }).map(updateData).tap(validateSchema).map(setData),
  upsert: (db, q) =>
    of({ db, q }).map(upsertData).tap(validateSchema).map(setData),
}

const wdb = db => {
  db ??= [
    {
      0: { name: "__dirs__", schema: dir_schema },
      1: {
        name: "__config__",
        schema: { type: "object", additionalProperties: false },
      },
    },
  ]
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
        if (!isNil(db[1])) throw Error("already initialized")
        db[1] = { info: { id: msg.id, owner: msg.from } }
        return db
      },
      set:
        (...msg) =>
        db => {
          const [op, ...q] = msg
          if (isNil(handlers[op])) throw Error(`handler doesn't exist: ${op}`)
          handlers[op](db, q)
          return db
        },
    },
  })
}

export default wdb
