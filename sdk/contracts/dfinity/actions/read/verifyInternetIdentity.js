const { sign } = require("../../lib/tweetnacl")

const decodeLen = (buf, offset) => {
  const lenBytes = decodeLenBytes(buf, offset)
  if (lenBytes === 1) return buf[offset]
  else if (lenBytes === 2) return buf[offset + 1]
  else if (lenBytes === 3) return (buf[offset + 1] << 8) + buf[offset + 2]
  else if (lenBytes === 4)
    return (buf[offset + 1] << 16) + (buf[offset + 2] << 8) + buf[offset + 3]
  throw new Error("Length too long (> 4 bytes)")
}

const bufEquals = (b1, b2) => {
  if (b1.byteLength !== b2.byteLength) return false
  const u1 = new Uint8Array(b1)
  const u2 = new Uint8Array(b2)
  for (let i = 0; i < u1.length; i++) {
    if (u1[i] !== u2[i]) return false
  }
  return true
}

const decodeLenBytes = (buf, offset) => {
  if (buf[offset] < 0x80) return 1
  if (buf[offset] === 0x80) throw new Error("Invalid length 0")
  if (buf[offset] === 0x81) return 2
  if (buf[offset] === 0x82) return 3
  if (buf[offset] === 0x83) return 4
  throw new Error("Length too long (> 4 bytes)")
}

const unwrapDER = (derEncoded, oid) => {
  let offset = 0
  const expect = (n, msg) => {
    if (buf[offset++] !== n) {
      throw new Error("Expected: " + msg)
    }
  }

  const buf = new Uint8Array(derEncoded)
  expect(0x30, "sequence")
  offset += decodeLenBytes(buf, offset)

  if (!bufEquals(buf.slice(offset, offset + oid.byteLength), oid)) {
    throw new Error("Not the expected OID.")
  }
  offset += oid.byteLength

  expect(0x03, "bit string")
  const payloadLen = decodeLen(buf, offset) - 1
  offset += decodeLenBytes(buf, offset)
  expect(0x00, "0 padding")
  const result = buf.slice(offset)
  if (payloadLen !== result.length) {
    throw new Error(
      `DER payload mismatch: Expected length ${payloadLen} actual length ${result.length}`
    )
  }
  return result
}

function fromHexString(hexString) {
  return new Uint8Array(
    (hexString.match(/.{1,2}/g) ?? []).map(byte => parseInt(byte, 16))
  ).buffer
}

const ED25519_OID = Uint8Array.from([
  ...[0x30, 0x05], // SEQUENCE
  ...[0x06, 0x03], // OID with 3 bytes
  ...[0x2b, 0x65, 0x70], // id-Ed25519 OID
])

const verify = async (state, action) => {
  const { data, signature, signer } = action.input
  let isValid = false
  try {
    if (
      sign.detached.verify(
        new Uint8Array(Buffer.from(JSON.stringify(data))),
        new Uint8Array(fromHexString(signature)),
        new Uint8Array(unwrapDER(fromHexString(signer), ED25519_OID).buffer)
      )
    ) {
      isValid = true
    }
  } catch (e) {
    console.log(e)
  }
  return { result: { isValid } }
}

module.exports = verify
