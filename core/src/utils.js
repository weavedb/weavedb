import { validate } from "jsonschema"
import { hash } from "fast-sha256"
import _fpjson from "fpjson-lang"
const fpjson = _fpjson.default || _fpjson
import { replace$ } from "./fpjson.js"
import { keys, uniq, concat, compose, is, isNil, includes, map } from "ramda"
import { put, del } from "./indexer.js"
import { keccak256 } from "./keccak.js"

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
  if (!query[0].schema) throw Error("schema is missing")
  if (!query[0].auth) throw Error("auth is missing")
  let auth = {}
  let auth_index = -1
  for (let v of query[0].auth) {
    auth[v[0]] = ++auth_index
    kv.put("_config", `auth_0_${auth_index}`, { auth: v })
  }

  kv.put("_", "_", { auth, triggers: {}, index: 0, auth_index })
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
  kv.put("_config", "schema_0", query[0].schema)
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
  const { data, dir, doc, before } = state
  if (isNil(kv.get("_", dir))) throw Error("dir doesn't exist")

  // Use existing before state to determine create flag
  const create = isNil(before) // true only if document doesn't exist

  put(data, doc, [dir.toString()], kv_dir, create)
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
  let schema = kv.get("_config", `schema_${state.dirinfo.index}`)
  try {
    valid = validate(data, schema).valid
  } catch (e) {}
  if (!valid) throw Error("invalid schema")
}

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

function base64urlToBytes(str) {
  const padded = str + "===".slice((str.length + 3) % 4)
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/")
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  let result = []

  for (let i = 0; i < base64.length; i += 4) {
    const encoded = base64.slice(i, i + 4)
    let bits = 0
    let validBits = 0

    for (let j = 0; j < encoded.length; j++) {
      if (encoded[j] !== "=") {
        bits = (bits << 6) | chars.indexOf(encoded[j])
        validBits += 6
      }
    }

    while (validBits >= 8) {
      validBits -= 8
      result.push((bits >> validBits) & 0xff)
    }
  }

  return new Uint8Array(result)
}

function bytesToBase64url(bytes) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
  let result = ""

  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0

    const combined = (a << 16) | (b << 8) | c

    result += chars[(combined >> 18) & 0x3f]
    result += chars[(combined >> 12) & 0x3f]
    if (i + 1 < bytes.length) result += chars[(combined >> 6) & 0x3f]
    if (i + 2 < bytes.length) result += chars[combined & 0x3f]
  }

  return result
}

function wdb23(arweaveAddress) {
  if (!arweaveAddress || typeof arweaveAddress !== "string") {
    throw new Error("Invalid Arweave address: must be a non-empty string")
  }
  arweaveAddress = arweaveAddress.trim()
  if (arweaveAddress.length !== 43) {
    throw new Error(
      `Invalid Arweave address length: expected 43 characters, got ${arweaveAddress.length}`,
    )
  }
  const base64urlPattern = /^[A-Za-z0-9\-_]+$/
  if (!base64urlPattern.test(arweaveAddress)) {
    throw new Error("Invalid Arweave address: contains invalid characters")
  }

  try {
    const arweaveBytes = base64urlToBytes(arweaveAddress)
    if (arweaveBytes.length !== 32) {
      throw new Error(
        `Invalid Arweave address: decoded to ${arweaveBytes.length} bytes, expected 32`,
      )
    }
    const wdb23Bytes = new Uint8Array(23)
    wdb23Bytes[0] = 0x61 // 'a'
    wdb23Bytes[1] = 0x72 // 'r'
    wdb23Bytes[2] = 0x2d // '-'
    wdb23Bytes.set(arweaveBytes.slice(0, 20), 3)
    const addressPart = bytesToBase64url(arweaveBytes.slice(0, 20))
    return `ar--${addressPart}`
  } catch (error) {
    throw new Error(`Failed to convert Arweave address: ${error.message}`)
  }
}

function wdb160(bufs) {
  let _bufs = map(v => {
    let type = "utf8"
    let val = v

    if (is(Array, v)) {
      val = v[0]
      type = v[1] ?? "utf8"
    }

    // Convert any data type to string first
    if (typeof val !== "string") {
      if (val === null || val === undefined) {
        val = String(val)
      } else if (typeof val === "object") {
        val = JSON.stringify(val)
      } else {
        val = String(val)
      }
    }

    // Auto-detect base64url for WDB23 addresses (31 chars = 23 bytes)
    if (type === "utf8" && val.length === 31 && isBase64url(val)) {
      type = "base64url"
    }

    // Handle hex strings
    if (type === "hex" && val.startsWith("0x")) {
      val = val.slice(2)
    }

    // Handle base64url by converting to base64
    if (type === "base64url") {
      val = val.replace(/-/g, "+").replace(/_/g, "/")
      while (val.length % 4) {
        val += "="
      }
      type = "base64"
    }

    return Buffer.from(val, type)
  })(bufs)
  return to64(keccak256(Buffer.concat(_bufs)))
}

function isBase64url(str) {
  // Base64url character set: A-Z, a-z, 0-9, -, _
  const base64urlRegex = /^[A-Za-z0-9_-]+$/
  return base64urlRegex.test(str)
}

function to64(from) {
  return Buffer.from(from)
    .slice(0, 20)
    .toString("base64")
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
    .replace(/=/g, "")
}

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
const BASE = ALPHABET.length
const LEADER = ALPHABET.charAt(0)
const FACTOR = Math.log(BASE) / Math.log(256)
const iFACTOR = Math.log(256) / Math.log(BASE)

function toCID(source) {
  if (source instanceof Uint8Array);
  else if (ArrayBuffer.isView(source)) {
    source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength)
  } else if (Array.isArray(source)) source = Uint8Array.from(source)
  if (!(source instanceof Uint8Array)) {
    throw new TypeError("Expected Uint8Array")
  }
  if (source.length === 0) return ""

  let zeroes = 0
  let length = 0
  let pbegin = 0
  let pend = source.length
  while (pbegin !== pend && source[pbegin] === 0) {
    pbegin++
    zeroes++
  }

  let size = ((pend - pbegin) * iFACTOR + 1) >>> 0
  let b58 = new Uint8Array(size)
  while (pbegin !== pend) {
    let carry = source[pbegin]
    let i = 0
    for (
      let it1 = size - 1;
      (carry !== 0 || i < length) && it1 !== -1;
      it1--, i++
    ) {
      carry += (256 * b58[it1]) >>> 0
      b58[it1] = carry % BASE >>> 0
      carry = (carry / BASE) >>> 0
    }
    if (carry !== 0) throw new Error("Non-zero carry")
    length = i
    pbegin++
  }
  let it2 = size - length
  while (it2 !== size && b58[it2] === 0) it2++
  let str = LEADER.repeat(zeroes)
  for (; it2 < size; ++it2) str += ALPHABET.charAt(b58[it2])
  return str
}

function cid(json) {
  const hashBytes = hash(new TextEncoder().encode(JSON.stringify(json)))
  return toCID(new Uint8Array([18, hashBytes.length, ...Array.from(hashBytes)]))
}

export {
  cid,
  wdb160,
  wdb23,
  checkDocID,
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
