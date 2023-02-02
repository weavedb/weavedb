const Arweave = require("arweave")

const validate = async (input, verifyingContract) => {
  const { query, nonce, signature, caller, pubKey } = input
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
  return { err, signer }
}

module.exports = { validate }
