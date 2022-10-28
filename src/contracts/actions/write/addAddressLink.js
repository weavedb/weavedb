import { isNil } from "ramda"
import { err } from "../../lib/utils"
import { validate } from "../../lib/validate"
const { recoverTypedSignature } = require("../../lib/eth-sig-util")

export const addAddressLink = async (state, action, signer) => {
  signer ||= await validate(state, action, "addAddressLink")
  const { address, signature } = action.input.query
  const { nonce } = action.input
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
    query: JSON.stringify({ func: "auth", query: { address: signer } }),
  }

  const data = {
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
  let signer2 = recoverTypedSignature({
    version: "V4",
    data,
    signature,
  })
  const _signer = signer2.toLowerCase()
  if (_signer !== address.toLowerCase()) err()
  if (!isNil(state.auth.links[address.toLowerCase()])) {
    err("link already exists")
  }
  state.auth.links[address.toLowerCase()] = signer
  return { state }
}
