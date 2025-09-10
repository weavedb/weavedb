import { validate } from "jsonschema"
import _fpjson from "fpjson-lang"
const fpjson = _fpjson.default || _fpjson
import { replace$ } from "./fpjson.js"
import { keys, uniq, concat, compose, is, isNil, includes } from "ramda"
import { put, del } from "./indexer.js"

import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"
import { createPrivateKey } from "node:crypto"

function parseOp(ctx) {
  const { state } = ctx
  state.op = state.query[0]
  state.opcode = state.op.split(":")[0]
  state.operand = state.op.split(":")[1] ?? null
  return arguments[0]
}

const signer = ({ jwk, id, nonce = 0 }) => {
  const signer = createHttpSigner(
    createPrivateKey({ key: jwk, format: "jwk" }),
    "rsa-pss-sha512",
    jwk.n,
  )
  return async (...query) =>
    await httpbis.signMessage(
      { key: signer, fields: ["query", "nonce", "id"] },
      {
        headers: {
          query: JSON.stringify(query),
          nonce: Number(++nonce).toString(),
          id,
        },
      },
    )
}

function initDB({ state: { query, signer, id: _id }, msg, env: { kv, id } }) {
  if (id) throw Error("already initialized")
  kv.put("_", "_", { ...query[0], index: 0 })
  kv.put("_", "_config", {
    index: 1,
    schema: { type: "object", additionalProperties: false },
    auth: [],
  })
  kv.put("_", "__indexes__", {
    index: 2,
    schema: { type: "object" },
    auth: [],
  })
  kv.put("_", "__accounts__", {
    index: 3,
    schema: { type: "object" },
    auth: [],
  })
  kv.put("_config", "info", {
    id: _id,
    owner: signer,
    last_dir_id: 3,
  })
  kv.put("_config", "config", { max_doc_id: 168, max_dir_id: 8 })
  return arguments[0]
}

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
          id: env.id,
          owner: env.owner,
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
  let _dir = env.kv.get("_", dir)
  if (isNil(_dir)) throw Error("dir doesn't exist:", dir)
  let i = isNil(_dir.autoid) ? 0 : _dir.autoid + 1
  const docs = env.kv[dir] ?? {}
  while (env.kv.get(dir, tob64(i))) i++
  state.doc = tob64(i)
  _dir.autoid = i
  env.kv.put("_", dir, _dir)
  return arguments[0]
}

function putData({ state, env: { kv, kv_dir } }) {
  const { data, dir, doc } = state
  if (isNil(kv.get("_", dir))) throw Error("dir doesn't exist")
  put(data, doc, [dir.toString()], kv_dir, true)
  return arguments[0]
}

function delData({ state, env }) {
  const { dir, doc } = state
  if (isNil(env.kv.get("_", dir))) throw Error("dir doesn't exist")
  del(doc, [dir], env.kv_dir)
  return arguments[0]
}

function validateSchema({ state, env: { kv } }) {
  let valid = false
  const { data, dir } = state
  let _dir = kv.get("_", dir)
  try {
    valid = validate(data, _dir.schema).valid
  } catch (e) {}
  if (!valid) throw Error("invalid schema")
}

export {
  parseOp,
  initDB,
  signer,
  fields,
  merge,
  genDocID,
  putData,
  delData,
  validateSchema,
}
