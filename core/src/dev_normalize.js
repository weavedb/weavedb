import { includes, isNil } from "ramda"
import {
  extractPubKey,
  rsaid,
  hmacid,
  id,
  base,
  hashpath,
  httpsig_from,
  structured_to,
} from "hbsig"
import { of, ka } from "monade"
import sha256 from "fast-sha256"
import { parseOp } from "./utils.js"

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

function ar2wdb23(arweaveAddress) {
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
const toMsg = req => {
  let msg = {}
  for (const k in req?.headers ?? {}) msg[k] = req.headers[k]
  if (req.body) msg.body = req.body
  return msg
}

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

function toLower({ msg, env }) {
  if (!msg) return arguments[0]
  let lowers = { signature: null, "signature-input": null }
  for (const k in msg.headers) {
    const lower = k.toLowerCase()
    if (includes(lower, ["signature", "signature-input"])) {
      lowers[lower] = msg.headers[k]
      delete msg.headers[k]
    }
  }
  msg.headers = { ...msg.headers, ...lowers }
  return arguments[0]
}

function commit(msg, components) {
  let body = {}
  const inlineBodyKey = msg.headers["inline-body-key"]
  for (const v of components) {
    const key = v === "@path" ? "path" : v
    body[key] = msg.headers[key]
  }
  if (msg.body) {
    let bodyContent = msg.body
    if (inlineBodyKey === "data") {
      body.data = bodyContent
    } else {
      body.body = bodyContent
    }
  }

  // Remove inline-body-key from the final body as it's just metadata
  delete body["inline-body-key"]

  const hmacId = hmacid(msg.headers)
  const rsaId = rsaid(msg.headers)
  const pub = extractPubKey(msg.headers)
  const committer = toAddr(pub.toString("base64"))
  const meta = { alg: "rsa-pss-sha512", "commitment-device": "httpsig@1.0" }
  const meta2 = { alg: "hmac-sha256", "commitment-device": "httpsig@1.0" }
  const sigs = {
    signature: msg.headers.signature,
    "signature-input": msg.headers["signature-input"],
  }
  const committed = {
    commitments: {
      [rsaId]: { ...meta, committer, ...sigs },
      [hmacId]: { ...meta2, ...sigs },
    },
    ...body,
  }
  return committed
}

function pickInput({ state, msg, env }) {
  if (!msg) return arguments[0]
  let _headers = structured_to(httpsig_from(toMsg(msg)))
  let etc = {}
  const { fields, keyid } = parseSI(msg.headers["signature-input"])
  let headers = {
    signature: msg.headers.signature,
    ["signature-input"]: msg.headers["signature-input"],
  }
  for (const v of fields) {
    if (typeof msg.headers[v] === "undefined") throw Error("invalid signature")
    headers[v] = msg.headers[v]
    if (v.toLowerCase() === "content-digest") etc.body = msg.body
  }
  const committed = commit(msg, fields)
  let info = env.kv.get("__meta__", "current") ?? {}
  state.hashpath = !info.hashpath
    ? `${_headers.id}/${id(committed)}`
    : hashpath(info.hashpath, committed)
  state.signer = toAddr(keyid)
  state.signer23 = ar2wdb23(state.signer)
  state.query = JSON.parse(_headers.query)
  if (typeof _headers.id === "undefined") throw Error("id missing")
  if (typeof _headers.nonce === "undefined") throw Error("nonce missing")
  state.id = _headers.id
  state.nonce = _headers.nonce
  state.ts = msg.ts ?? Date.now()
  arguments[0].msg = { headers, ...etc }
  return arguments[0]
}

const normalize = ka().map(toLower).map(pickInput).map(parseOp)

export default normalize
