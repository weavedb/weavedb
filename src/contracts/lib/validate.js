import { isNil } from "ramda"
const { recoverTypedSignature } = require("./eth-sig-util")
export const validate = (state, action, func) => {
  const { query, nonce, signature, caller } = action.input
  const _caller = caller.toLowerCase()
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

  const signer = recoverTypedSignature({
    version: "V4",
    data: _data,
    signature,
  })
  const original_signer = signer.toLowerCase()
  let _signer = signer.toLowerCase()
  if (!isNil(state.auth.links[_signer])) _signer = state.auth.links[_signer]
  if (_signer !== _caller) throw new ContractError(`The wrong signature`)
  if ((state.nonces[original_signer] || 0) + 1 !== nonce) {
    throw new ContractError(`The wrong nonce`)
  }
  if (isNil(state.nonces[original_signer])) state.nonces[original_signer] = 0
  state.nonces[original_signer] += 1
  return _signer
}
