import { validate } from "jsonschema"
import { clone, includes, isNil, mergeLeft, pluck } from "ramda"
import { fpj, ac_funcs } from "./fpjson.js"
import parseQuery from "./parser.js"
import {
  put,
  mod,
  del,
  addIndex,
  getIndexes,
  removeIndex,
} from "../src/indexer.js"
import { get } from "../src/planner.js"

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

function tob64(n) {
  if (!Number.isInteger(n) || n < 0)
    throw new Error("Only non-negative integers allowed")
  if (n === 0) return BASE64_CHARS[0]
  let result = ""
  while (n > 0) {
    result = BASE64_CHARS[n % 64] + result
    n = Math.floor(n / 64)
  }
  return result
}

function updateData({ db, ctx }) {
  const { data, dir, doc } = ctx
  const old = db.get(dir, doc)
  if (isNil(old)) throw Error("data doesn't exist")
  ctx.data = mergeLeft(data, old)
  return arguments[0]
}

function upsertData({ db, ctx }) {
  const { data, dir, doc } = ctx
  if (isNil(db.dir(dir))) throw Error("dir doesn't exist")
  const old = db.get(dir, doc)
  if (!isNil(old)) ctx.data = mergeLeft(data, old)
  return arguments[0]
}

const validateSchema = ({ db, ctx }) => {
  let valid = false
  const { data, dir } = ctx
  const schema = db.dir(dir).schema
  try {
    valid = validate(data, schema).valid
  } catch (e) {}
  if (!valid) throw Error("invalid schema")
}

function setData({ db, ctx }) {
  const { data, dir, doc } = ctx
  if (isNil(db.dir(dir))) throw Error("dir doesn't exist")
  put(data, doc, [dir.toString()], ctx.kv, true)
  return arguments[0]
}

function delData({ db, ctx }) {
  const { dir, doc } = ctx
  if (isNil(db.dir(dir))) throw Error("dir doesn't exist")
  del(doc, [dir.toString()], ctx.kv)
  return arguments[0]
}

function getDocID({ db, ctx }) {
  const { dir } = ctx
  let _dir = db.dir(dir)
  if (isNil(_dir)) throw Error("dir doesn't exist")
  let i = isNil(_dir.autoid) ? 0 : _dir.autoid + 1
  const docs = db[dir] ?? {}
  while (db.get(dir, tob64(i))) i++
  ctx.doc = tob64(i)
  _dir.autoid = i
  db.put(0, dir, _dir)
  return arguments[0]
}

function commit({ db }) {
  db.commit()
}

function init({ db, ctx, q }) {
  let data, dir, doc
  if (ctx.op === "get") {
    ;[dir, doc] = q
    ctx.dir = dir
    if (typeof doc === "string") {
      ctx.doc = doc
      ctx.range = false
    } else ctx.range = true
  } else if (ctx.op === "add") {
    ;[data, dir] = q
    ctx.dir = dir
    ctx.data = data
  } else if (ctx.op === "del") {
    ;[dir, doc] = q
    ctx.dir = dir
    ctx.doc = doc
  } else {
    ;[data, dir, doc] = q
    ctx.dir = dir
    ctx.doc = doc
    ctx.data = data
  }
  ctx.kv = {
    get: k => db.get(2, `${dir}/${k}`),
    put: (k, v, nosave) => db.put(2, `${dir}/${k}`, v),
    del: (k, nosave) => db.del(2, `${dir}/${k}`),
    data: key => ({
      val: db.get(dir, key),
      __id__: key.split("/").pop(),
    }),
    putData: (key, val) => db.put(dir, key, val),
    delData: key => db.del(dir, key),
  }
  return arguments[0]
}

function auth({ db, q, ctx }) {
  const { dir, doc, op, opname } = ctx
  let vars = {
    op,
    opname,
    from: "",
    tx: 0,
    dir,
    doc,
    db: {},
    old: {},
    new: {},
    allow: false,
  }
  const _dir = db.dir(dir)
  if (isNil(_dir)) throw Error(`dir doesn't exist: ${dir}`)
  let allow = false
  for (const v of _dir.auth) {
    if (includes(ctx.opname, v[0].split(","))) {
      try {
        fpj(v[1], vars, ac_funcs)
        if (vars.allow) allow = true
        break
      } catch (e) {}
    }
  }
  if (!allow) throw Error("operation not allowed")
  return arguments[0]
}

function getDocs({ db, q, ctx }) {
  const { dir, doc } = ctx
  if (isNil(db.dir(dir))) throw Error("dir doesn't exist")
  const parsed = parseQuery(q)
  const res = get(parsed, ctx.kv)
  return ctx.range ? pluck("val")(res) : res.val
}

export {
  init,
  auth,
  updateData,
  upsertData,
  validateSchema,
  setData,
  delData,
  getDocID,
  commit,
  getDocs,
}
