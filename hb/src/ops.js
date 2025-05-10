import { validate } from "jsonschema"
import { intersection, clone, includes, isNil, mergeLeft, pluck } from "ramda"
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

import sha256 from "fast-sha256"
function base64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  const pad = str.length % 4
  if (pad === 2) str += "=="
  else if (pad === 3) str += "="
  else if (pad !== 0) throw new Error("Invalid base64url string")
  const bin = atob(str)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}
function base64urlEncode(bytes) {
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  let b64 = btoa(bin)
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function toAddr(n) {
  const pubBytes = base64urlDecode(n)
  const hash = sha256(pubBytes)
  return base64urlEncode(hash)
}

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

function parseSI(input) {
  const eq = input.indexOf("=")
  if (eq < 0) throw new Error("Invalid Signature-Input (no `=` found)")
  const label = input.slice(0, eq).trim()
  let rest = input.slice(eq + 1).trim()

  if (!rest.startsWith("(")) {
    throw new Error("Invalid Signature-Input (fields list missing)")
  }
  const endFields = rest.indexOf(")")
  if (endFields < 0) {
    throw new Error("Invalid Signature-Input (unclosed fields list)")
  }
  const fieldsRaw = rest.slice(1, endFields)
  const fields = fieldsRaw
    .split(/\s+/)
    .map(f => f.replace(/^"|"$/g, "").toLowerCase())

  rest = rest.slice(endFields + 1)

  const params = []
  rest.split(";").forEach(part => {
    const p = part.trim()
    if (!p) return

    const m = p.match(
      /^([a-z0-9-]+)=(?:"((?:[^"\\]|\\.)*)"|([0-9]+|[A-Za-z0-9-._~]+))$/i,
    )
    if (!m) {
      throw new Error(`Invalid parameter in Signature-Input: ${p}`)
    }
    const key = m[1].toLowerCase()
    const val =
      m[2] != null ? m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\") : m[3]
    params.push({ key, val })
  })

  const obj = { label, fields }
  for (const { key, val } of params) {
    if (key === "alg") obj.alg = val
    if (key === "keyid") obj.keyid = val
    if (key === "created") obj.created = Number(val)
    if (key === "expires") obj.expires = Number(val)
    if (key === "nonce") obj.nonce = val
  }

  if (!obj.alg) throw new Error("Missing `alg` in Signature-Input")
  if (!obj.keyid) throw new Error("Missing `keyid` in Signature-Input")

  return obj
}

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
  db.put("__dirs__", dir, _dir)
  return arguments[0]
}

function commit({ db, ctx }) {
  if (ctx.opt.no_commit !== true) db.commit(ctx.opt)
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
    get: k => db.get("__indexes__", `${dir}/${k}`),
    put: (k, v, nosave) => db.put("__indexes__", `${dir}/${k}`, v),
    del: (k, nosave) => db.del("__indexes__", `${dir}/${k}`),
    data: key => ({
      val: db.get(dir, key),
      __id__: key.split("/").pop(),
    }),
    putData: (key, val) => db.put(dir, key, val),
    delData: key => db.del(dir, key),
  }
  return arguments[0]
}

function verifyNonce({ db, q, ctx }) {
  const { fields, keyid } = parseSI(ctx.opt["signature-input"])
  if (intersection(["query", "nonce"], fields).length !== 2) {
    throw Error("nonce or query not signed")
  }
  ctx.from = toAddr(keyid)
  const acc = db.get("__accounts__", ctx.from)
  const nonce = acc?.nonce ?? 0
  if (+ctx.opt.nonce !== nonce + 1) throw Error(`the wrong nonce: ${nonce}`)
  db.put("__accounts__", ctx.from, { ...acc, nonce: nonce + 1 })
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
  const _dir = db.dir(dir)
  if (isNil(_dir)) throw Error(`dir doesn't exist: ${dir}`)
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
  verifyNonce,
}
