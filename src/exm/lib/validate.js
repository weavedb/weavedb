import { includes, isNil } from "ramda"
import { Buffer } from "./buffer"

export const validate = async (state, action, func) => {
  const {
    query,
    nonce,
    signature,
    caller,
    type = "rsa256",
    pubKey,
  } = action.input

  if (!includes(type)(state.auth.algorithms || ["rsa256"])) {
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
    verifyingContract: "exm",
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
  if (type === "rsa256") {
    let encoded_data = JSON.stringify(_data)
    if (typeof TextEncoder !== "undefined") {
      const enc = new TextEncoder()
      encoded_data = enc.encode(encoded_data)
    }
    const isValid = await SmartWeave.arweave.crypto.verify(
      pubKey,
      encoded_data,
      Buffer.from(signature, "hex")
    )
    if (isValid) {
      signer = caller
    } else {
      throw new ContractError(`The wrong signature`)
    }
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
