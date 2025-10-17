import {
  extractPubKey,
  rsaid,
  hmacid,
  id,
  hashpath,
  httpsig_from,
  structured_to,
} from "hbsig/nocrypto"
import { of, ka } from "monade"
import { toAddr, parseOp, wdb23 } from "./utils.js"
import { includes, isNil } from "ramda"
import version from "./version.js"

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

const toMsg = req => {
  let msg = {}
  for (const k in req?.headers ?? {}) msg[k] = req.headers[k]
  if (req.body) msg.body = req.body
  return msg
}

function pickInput({ state, msg, env }) {
  if (!msg) return arguments[0]
  let _headers = structured_to(httpsig_from(toMsg(msg)))
  if (typeof _headers.id === "undefined") throw Error("id missing")
  if (typeof _headers.nonce === "undefined") throw Error("nonce missing")
  let etc = {}
  const { fields, keyid } = parseSI(msg.headers["signature-input"])
  etc.fields = fields
  etc.keyid = keyid
  let headers = {
    signature: msg.headers.signature,
    ["signature-input"]: msg.headers["signature-input"],
  }
  for (const v of fields) {
    if (typeof msg.headers[v] === "undefined") throw Error("invalid signature")
    headers[v] = msg.headers[v]
    if (v.toLowerCase() === "content-digest") etc.body = msg.body
  }
  arguments[0].msg = Object.freeze({ headers, ...etc })
  return arguments[0]
}

export default ka().map(toLower).map(pickInput)
