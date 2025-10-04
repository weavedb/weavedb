import { httpbis, createVerifier } from "http-message-signatures"
import {
  verify as _verify,
  httpsig_from,
  structured_to,
  toAddr,
  result,
} from "hbsig"
const { verifyMessage } = httpbis
import { createPublicKey } from "node:crypto"
import { open } from "lmdb"
import _Arweave from "arweave"
const Arweave = _Arweave.default ?? _Arweave
const arweave = Arweave.init()
import { connect, createSigner } from "@permaweb/aoconnect"
import { kv } from "wdb-core"
import draft_07 from "./jsonschema-draft-07.js"

const dir_schema = {
  type: "object",
  required: ["index", "schema", "auth"],
  properties: {
    index: { type: "number" },
    schema: { $ref: "http://json-schema.org/draft-07/schema#" },
    docs: {
      type: "object",
      propertyNames: {
        type: "string",
        pattern: "^[A-Za-z0-9_-]+$",
        maxLength: 42,
      },
      additionalProperties: {
        type: "object",
        required: ["schema"],
        properties: {
          schema: { $ref: "http://json-schema.org/draft-07/schema#" },
        },
      },
    },
    auth: { type: "array" },
  },
  definitions: { draft_07 },
}
const dirs_set = [
  "set:dir",
  [
    ["=$isOwner", ["equals", "$signer", "$owner"]],
    ["=$dir", ["get()", ["_config", "info"]]],
    ["=$dirid", ["inc", "$dir.last_dir_id"]],
    ["mod()", { index: "$dirid" }],
    ["update()", [{ last_dir_id: "$dirid" }, "_config", "info"]],
    ["allowif()", "$isOwner"],
  ],
]
export { dirs_set }
export const init_query = { schema: dir_schema, auth: [dirs_set] }

const toMsg = async req => {
  let req2 = {}
  for (const k in req?.headers ?? {}) req2[k] = req.headers[k]
  if (typeof req.body?.toString === "function") {
    req2.body = req.body.toString()
  } else if (typeof req.body?.text === "function") {
    req2.body = await req.body.text()
  } else if (req.body) req2.body = req.body
  return req2
}

const verify = async req => {
  let valid = false
  let address = null
  let query = null
  let ts = Date.now()
  try {
    const {
      valid,
      keyId,
      decodedSignatureInput: { components },
    } = await _verify(req)
    address = toAddr(keyId)
    const msg = structured_to(httpsig_from(await toMsg(req)))
    query = JSON.parse(msg.query)
    return { valid, address, query, ts, fields: components }
  } catch (e) {
    console.log(e)
    return { err: true, valid, address, query, ts, fields: null }
  }
}

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
const getKV2 = ({ pid, dbpath }) => {
  const io = open({ path: `${dbpath}/${pid}` })
  return kv(io, async c => {})
}
const getKV = ({ jwk, pid, hb, dbpath }) => {
  let request = null
  if (jwk && hb) {
    ;({ request } = connect({
      MODE: "mainnet",
      URL: hb,
      device: "",
      signer: createSigner(jwk),
    }))
  }
  const io = open({ path: `${dbpath}/${pid}` })
  let addr = null
  return kv(io, async c => {
    let bundle = []
    let i = c.from
    for (const d of c.data) {
      if (
        d.opt?.headers &&
        typeof d.opt?.headers === "object" &&
        d.opt?.headers["signature"]
      ) {
        bundle.push(d.opt)
      }
      i++
    }
    if (bundle.length > 0) {
      if (request && pid) {
        if (!addr) {
          const txt = await fetch(
            `${hb}/~meta@1.0/info/serialize~json@1.0`,
          ).then(r => r.json())
          addr = txt.address
        }
        const tags = {
          method: "POST",
          path: `/${pid}/schedule`,
          scheduler: addr,
          data: JSON.stringify(bundle),
        }
        const res = await request(tags)
        console.log(`[${res.slot}] ${res.process}`)
      }
    }
  })
}

const getMsgs = async ({ hb, pid, from = 0, to = 99 }) => {
  let params = `target=${pid}`
  if (from) params += `&from=${from}`
  if (to) params += `&to=${to}`
  const res = await fetch(`${hb}/~scheduler@1.0/schedule?${params}`)
  const { out } = await result(res)
  return out
}

export { verify, parseSI, getKV, getMsgs, getKV2 }
