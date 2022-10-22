import { includes, isNil } from "ramda"
import { sign } from "tweetnacl"
import { utils } from "ethers"
const {
  recoverPersonalSignature,
  recoverTypedSignature,
} = require("./eth-sig-util")

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

const decodeLen = (buf, offset) => {
  const lenBytes = decodeLenBytes(buf, offset)
  if (lenBytes === 1) return buf[offset]
  else if (lenBytes === 2) return buf[offset + 1]
  else if (lenBytes === 3) return (buf[offset + 1] << 8) + buf[offset + 2]
  else if (lenBytes === 4)
    return (buf[offset + 1] << 16) + (buf[offset + 2] << 8) + buf[offset + 3]
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

export const validate = async (state, action, func) => {
  const {
    query,
    nonce,
    signature,
    caller,
    type = "secp256k1",
    pubKey,
  } = action.input

  if (
    !includes(type)(
      state.auth.algorithms || [
        "secp256k1",
        "secp256k1-2",
        "ed25519",
        "rsa256",
        "poseidon",
      ]
    )
  ) {
    throw new ContractError(`The wrong algorithm`)
  }
  let _caller = caller
  const EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "string" },
  ]

  const domain = {
    name: state.auth.name,
    version: state.auth.version,
    verifyingContract: SmartWeave.contract.id,
  }

  const message = {
    nonce,
    query: JSON.stringify({ func, query }),
  }

  const _data = {
    types: {
      EIP712Domain,
      Query: [
        { name: "query", type: "string" },
        { name: "nonce", type: "uint256" },
      ],
    },
    domain,
    primaryType: "Query",
    message,
  }
  let signer = null
  if (type === "ed25519") {
    try {
      if (
        sign.detached.verify(
          new Uint8Array(Buffer.from(JSON.stringify(_data))),
          new Uint8Array(fromHexString(signature)),
          new Uint8Array(unwrapDER(fromHexString(caller), ED25519_OID).buffer)
        )
      ) {
        signer = caller
      } else {
        throw new ContractError(`The wrong signature`)
      }
    } catch (e) {
      throw new ContractError(`The wrong signature`)
    }
  } else if (type === "rsa256") {
    let encoded_data = JSON.stringify(_data)
    if (typeof TextEncoder !== "undefined") {
      const enc = new TextEncoder()
      encoded_data = enc.encode(encoded_data)
    }
    const isValid = await SmartWeave.arweave.wallets.crypto.verify(
      pubKey,
      encoded_data,
      Buffer.from(signature, "hex")
    )
    if (isValid) {
      signer = caller
    } else {
      throw new ContractError(`The wrong signature`)
    }
  } else if (type == "secp256k1") {
    signer = recoverTypedSignature({
      version: "V4",
      data: _data,
      signature,
    })
  } else if (type == "secp256k1-2") {
    signer = recoverPersonalSignature({
      data: JSON.stringify(_data),
      signature,
    })
  } else if (type == "poseidon") {
    const { isValid } = (
      await SmartWeave.contracts.viewContractState(state.contracts.intmax, {
        function: "verify",
        data: _data,
        signature,
        pubKey,
      })
    ).result
    if (isValid) {
      signer = caller
    } else {
      throw new ContractError(`The wrong signature`)
    }
  }

  if (includes(type)(["secp256k1", "secp256k1-2", "poseidon"])) {
    if (/^0x/.test(signer)) signer = signer.toLowerCase()
    if (/^0x/.test(_caller)) _caller = _caller.toLowerCase()
  }

  let original_signer = signer
  let _signer = signer
  if (!isNil(state.auth.links[_signer])) _signer = state.auth.links[_signer]
  if (_signer !== _caller) throw new ContractError(`signer is not caller`)
  if ((state.nonces[original_signer] || 0) + 1 !== nonce) {
    throw new ContractError(`The wrong nonce`)
  }
  if (isNil(state.nonces[original_signer])) state.nonces[original_signer] = 0
  state.nonces[original_signer] += 1
  return _signer
}
