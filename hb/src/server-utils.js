import { httpbis, createVerifier } from "http-message-signatures"
const { verifyMessage } = httpbis
import { createPublicKey } from "node:crypto"
import _Arweave from "arweave"
const Arweave = _Arweave.default ?? _Arweave
const arweave = Arweave.init()

const verify = async req => {
  let valid = false
  let address = null
  let query = null
  let ts = Date.now()
  try {
    const input = parseSignatureInput(req.headers["signature-input"])
    const key = { kty: "RSA", n: input.keyid, e: "AQAB" }
    const verifier = createVerifier(
      createPublicKey({ key, format: "jwk" }),
      "rsa-pss-sha512",
    )
    valid = await verifyMessage(
      { keyLookup: params => ({ verify: verifier }) },
      {
        method: req.method,
        headers: req.headers,
        url: `https://weavedb.dev${req.headers.path}`,
      },
    )
    address = await arweave.wallets.jwkToAddress(key)
    query = JSON.parse(req.headers.query)
    return { valid, address, query, ts }
  } catch (e) {
    return { err: true, valid, address, query, ts }
  }
}
function parseSignatureInput(input) {
  const match = input.match(
    /^([^=]+)=\(([^)]+)\);alg="([^"]+)";keyid="([^"]+)"$/,
  )
  if (!match) throw new Error("Invalid signature-input format")

  const [, label, fieldsStr, alg, keyid] = match
  const fields = fieldsStr.split('" "').map(f => f.replace(/"/g, ""))
  return { label, fields, alg, keyid }
}

export { verify }
