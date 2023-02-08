const Arweave = require("arweave")
const {
  recoverTypedSignature,
  recoverPersonalSignature,
} = require("@metamask/eth-sig-util")
const { verifyII } = require("./internet-identity")

const validate = async (input, verifyingContract) => {
  const { query, nonce, signature, caller, type = "secp256k1", pubKey } = input
  const EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "string" },
  ]

  const domain = {
    name: "weavedb",
    version: "1",
    verifyingContract,
  }

  const message = {
    nonce,
    query: JSON.stringify({ func: "admin", query }),
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
  let err = null
  if (type === "rsa256") {
    try {
      let encoded_data = JSON.stringify(_data)
      const enc = new TextEncoder()
      encoded_data = enc.encode(encoded_data)
      const _crypto = Arweave.crypto
      const isValid = await _crypto.verify(
        pubKey,
        encoded_data,
        Buffer.from(signature, "hex")
      )
      if (isValid) {
        signer = caller
      } else {
        err = true
      }
    } catch (e) {
      err = true
    }
  } else if (type === "secp256k1") {
    signer = recoverTypedSignature({
      version: "V4",
      data: _data,
      signature,
    })
  } else if (type === "ed25519") {
    try {
      const isValid = await verifyII(_data, signature, caller)
      if (isValid) {
        signer = caller
      } else {
        err = true
      }
    } catch (e) {
      err = true
    }
  } else if (type == "secp256k1-2") {
    signer = recoverPersonalSignature({
      data: JSON.stringify(_data),
      signature,
    })
  }
  return { err, signer }
}

module.exports = { validate }
