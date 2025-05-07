import { of } from "./monade.js"
import { dir_schema } from "./schemas.js"
import { tail, is, isNil, clone, includes } from "ramda"
import {
  updateData,
  upsertData,
  validateSchema,
  setData,
  delData,
  getDocID,
  commit,
} from "./ops.js"

import { fpj, ac_funcs } from "./fpjson.js"
import lsjson from "../src/lsjson.js"

const auth = ({ db, q, ctx }) => {
  let data, dir, doc
  if (ctx.op === "add") {
    ;[data, dir] = q
  } else if (ctx.op === "del") {
    ;[dir, doc] = q
  } else {
    ;[data, dir, doc] = q
  }
  let vars = {
    op: ctx.op,
    opname: ctx.opname,
    from: "",
    tx: 0,
    dir,
    doc,
    db: {},
    old: {},
    new: {},
    allow: false,
  }
  if (isNil(db[0][dir])) throw Error(`dir doesn't exist: ${dir}`)
  let allow = false
  for (const v of db[0][dir].auth) {
    if (includes(ctx.opname, v[0].split(","))) {
      try {
        fpj(v[1], vars, ac_funcs)
        if (vars.allow) allow = true
        break
      } catch (e) {}
    }
  }
  if (!allow) throw Error("operation not allowed")
  return { db, q, ctx }
}

const handlers = {
  add: (db, q, ctx) =>
    of({ db, q, ctx })
      .map(auth)
      .tap(validateSchema)
      .map(getDocID)
      .map(setData)
      .tap(commit),
  set: (db, q, ctx) =>
    of({ db, q, ctx }).map(auth).tap(validateSchema).map(setData).tap(commit),
  del: (db, q, ctx) => of({ db, q, ctx }).map(auth).map(delData).tap(commit),
  update: (db, q, ctx) =>
    of({ db, q, ctx })
      .map(auth)
      .map(updateData)
      .tap(validateSchema)
      .map(setData)
      .tap(commit),
  upsert: (db, q, ctx) =>
    of({ db, q, ctx })
      .map(auth)
      .map(upsertData)
      .tap(validateSchema)
      .map(setData)
      .tap(commit),
}

const rules = {
  dirs_set: ["set", [["allow()"]]],
}

const wdb = (db, kv) => {
  db = kv ? lsjson([], { kv }) : (db ?? [])
  if (db.length === 0) {
    db.push({
      0: {
        name: "__dirs__",
        schema: dir_schema,
        auth: [rules.dirs_set],
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
            handlers[ctx.op](db, q, ctx)
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
