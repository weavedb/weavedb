import { of, fn } from "./monade.js"
import { keys, uniq, concat, compose, is, isNil, includes } from "ramda"
import _fpjson from "fpjson-lang"
const fpjson = _fpjson.default || _fpjson
import sql_parser from "node-sql-parser"
const _parser = new sql_parser.Parser()

import { replace$ } from "./fpjson.js"
function fields(ndata, odata) {
  let nkeys = keys(ndata)
  let okeys = keys(odata)
  return compose(uniq, concat(nkeys))(okeys)
}

function merge(data, state, old, env) {
  old ??= state.before
  let new_data = {}
  const _fields = fields(data, old)
  for (const k of _fields) {
    if (typeof data[k] !== "undefined") {
      if (data[k] !== null && is(Object, data[k]) && !isNil(data[k]._$)) {
        let vars = {
          signer: state.signer,
          ts: state.ts,
          id: env.info.id,
          owner: env.info.owner,
        }
        if (typeof data[k]._$ === "string") {
          if (data[k]._$ === "del") continue
          if (typeof vars[data[k]._$] !== "undefined")
            new_data[k] = vars[data[k]._$]
        } else {
          new_data[k] = fpjson(replace$([data[k]._$, old[k] ?? null]), vars)
        }
      } else new_data[k] = data[k]
    } else new_data[k] = old[k]
  }
  return new_data
}

function setData({ state, env }) {
  const { data, dir } = state
  if (isNil(env.kv.dir(dir))) throw Error("dir doesn't exist")
  state.data = merge(data, state, {}, env)
  return arguments[0]
}

function updateData({ state, env }) {
  const { data, dir, doc } = state
  if (isNil(state.before)) throw Error("data doesn't exist")
  state.data = merge(data, state, undefined, env)
  return arguments[0]
}

function upsertData({ state, env }) {
  const { data, dir, doc } = state
  if (isNil(env.kv.dir(dir))) throw Error("dir doesn't exist")
  if (!isNil(state.before)) state.data = merge(data, state, undefined, env)
  return arguments[0]
}

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

function genDocID({ state, env }) {
  const { dir } = state
  let _dir = env.kv.dir(dir)
  if (isNil(_dir)) throw Error("dir doesn't exist")
  let i = isNil(_dir.autoid) ? 0 : _dir.autoid + 1
  const docs = env.kv[dir] ?? {}
  while (env.kv.get(dir, tob64(i))) i++
  state.doc = tob64(i)
  _dir.autoid = i
  env.kv.put("_", dir, _dir)
  return arguments[0]
}

const parser = {}

function checkMaxDocID(id, size) {
  const b64 =
    id.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((2 * id.length) % 4)
  const buf = Buffer.from(b64, "base64")
  return buf.length <= size
}

function checkDocID(id, db) {
  if (!/^[A-Za-z0-9\-_]+$/.test(id)) throw Error(`invalid docID: ${id}`)
  else {
    const { max_doc_id } = db.get("_config", "config")
    if (!checkMaxDocID(id, max_doc_id)) throw Error(`docID too large: ${id}`)
  }
}

function parse({ state, env }) {
  state.query.shift()
  const { kv } = env
  let data, dir, doc
  if (state.opcode === "init") {
  } else {
  }

  env.kv_dir = {
    get: k => kv.get("__indexes__", `${dir}/${k}`),
    put: (k, v, nosave) => kv.put("__indexes__", `${dir}/${k}`, v),
    del: (k, nosave) => kv.del("__indexes__", `${dir}/${k}`),
    data: key => ({
      val: kv.get(dir, key),
      __id__: key.split("/").pop(),
    }),
    putData: (key, val) => kv.put(dir, key, val),
    delData: key => kv.del(dir, key),
  }
  if (parser[state.opcode]) of(arguments[0]).chain(parser[state.opcode])
  return arguments[0]
}
export default parse
