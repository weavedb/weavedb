import { httpbis, createVerifier } from "http-message-signatures"
const { verifyMessage } = httpbis
import { createPublicKey } from "node:crypto"
import { open } from "lmdb"
import _Arweave from "arweave"
const Arweave = _Arweave.default ?? _Arweave
const arweave = Arweave.init()
import { connect, createSigner } from "@permaweb/aoconnect"
import kv from "./kv.js"

const verify = async req => {
  let valid = false
  let address = null
  let query = null
  let ts = Date.now()
  let fields = null
  try {
    const { keyid, fields } = parseSI(req.headers["signature-input"])
    const key = { kty: "RSA", n: keyid, e: "AQAB" }
    const verifier = createVerifier(
      createPublicKey({ key, format: "jwk" }),
      "rsa-pss-sha512",
    )
    valid = await verifyMessage(
      { keyLookup: params => ({ verify: verifier }) },
      { headers: req.headers },
    )
    address = await arweave.wallets.jwkToAddress(key)
    query = JSON.parse(req.headers.query)
    return { valid, address, query, ts, fields }
  } catch (e) {
    return { err: true, valid, address, query, ts, fields }
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
  const io = open({ path: `${dbpath}-${pid}` })
  let addr = null
  return kv(io, async c => {
    let bundle = []
    for (const d of c.data) {
      if (d.opt && typeof d.opt === "object" && d.opt["signature"]) {
        bundle.push(d.opt)
      }
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
  const res = await fetch(
    `${hb}/~scheduler@1.0/schedule/serialize~json@1.0?${params}`,
  ).then(r => r.json())
  return res
}

export { verify, parseSI, getKV, getMsgs }
