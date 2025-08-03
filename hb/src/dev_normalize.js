import { includes, isNil } from "ramda"
import { extractPubKey, rsaid, hmacid, verify, id, base, hashpath } from "hbsig"
import { of, ka } from "monade"
import sha256 from "fast-sha256"
import { parseOp } from "./dev_common.js"
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
    ? id(committed)
    : hashpath(info.hashpath, committed)
  state.signer = toAddr(keyid)
  state.query = JSON.parse(msg.headers.query)
  if (typeof headers.id === "undefined") throw Error("id missing")
  if (typeof headers.nonce === "undefined") throw Error("nonce missing")
  state.id = headers.id
  state.nonce = headers.nonce
  state.ts = msg.ts ?? Date.now()
  arguments[0].msg = { headers, ...etc }
  return arguments[0]
}

const normalize = ka().map(toLower).map(pickInput).map(parseOp)

export default normalize
