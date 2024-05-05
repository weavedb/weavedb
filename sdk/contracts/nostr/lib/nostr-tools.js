const { schnorr } = require("./secp256k1")
const { sha256 } = require("./sha256")

const isRecord = obj => obj instanceof Object
function validateEvent(event) {
  if (!isRecord(event)) return false
  if (typeof event.kind !== "number") return false
  if (typeof event.content !== "string") return false
  if (typeof event.created_at !== "number") return false
  if (typeof event.pubkey !== "string") return false
  if (!event.pubkey.match(/^[a-f0-9]{64}$/)) return false

  if (!Array.isArray(event.tags)) return false
  for (let i = 0; i < event.tags.length; i++) {
    let tag = event.tags[i]
    if (!Array.isArray(tag)) return false
    for (let j = 0; j < tag.length; j++) {
      if (typeof tag[j] === "object") return false
    }
  }

  return true
}

const verifiedSymbol = Symbol("verified")
const utf8Encoder = new TextEncoder()

function serializeEvent(evt) {
  if (!validateEvent(evt))
    err("can't serialize event with wrong or missing properties")
  return JSON.stringify([
    0,
    evt.pubkey,
    evt.created_at,
    evt.kind,
    evt.tags,
    evt.content,
  ])
}

const u8a = a => a instanceof Uint8Array
const hexes = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, "0")
)
function bytesToHex(bytes) {
  if (!u8a(bytes)) throw new Error("Uint8Array expected")
  let hex = ""
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]]
  }
  return hex
}

function getEventHash(event) {
  let eventHash = sha256(utf8Encoder.encode(serializeEvent(event)))
  return bytesToHex(eventHash)
}

function verifySignature(event) {
  if (typeof event[verifiedSymbol] === "boolean") return event[verifiedSymbol]

  const hash = getEventHash(event)

  if (hash !== event.id) {
    return (event[verifiedSymbol] = false)
  }

  try {
    return (event[verifiedSymbol] = schnorr.verify(
      event.sig,
      hash,
      event.pubkey
    ))
  } catch (err) {
    return (event[verifiedSymbol] = false)
  }
}

module.exports = { verifySignature, validateEvent }
