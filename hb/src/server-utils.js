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
  const match = input.match(
    /^([^=]+)=\(([^)]+)\);alg="([^"]+)";keyid="([^"]+)"$/,
  )
  if (!match) throw new Error("Invalid signature-input format")

  const [, label, fieldsStr, alg, keyid] = match
  const fields = fieldsStr
    .split('" "')
    .map(f => f.replace(/"/g, "").toLowerCase())
  return { label, fields, alg, keyid }
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
  const io = open({ path: dbpath })
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
  return await fetch(
    `${hb}/~scheduler@1.0/schedule/serialize~json@1.0?${params}`,
  ).then(r => r.json())
}

export { verify, parseSI, getKV, getMsgs }
