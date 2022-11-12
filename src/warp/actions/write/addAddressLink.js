import { is, isNil } from "ramda"
import { err } from "../../../common/warp/lib/utils"
import { validate } from "../../../common/warp/lib/validate"

export const addAddressLink = async (state, action, signer) => {
  signer ||= await validate(state, action, "addAddressLink")
  const { address, signature, expiry } = action.input.query
  if (!isNil(expiry) && !is(Number, expiry)) err("expiry must be a number")
  const { nonce } = action.input
  let _expiry = expiry || 0
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
  const query =
    typeof expiry === "undefined"
      ? { address: signer }
      : { address: signer, expiry }
  const message = {
    nonce,
    query: JSON.stringify({
      func: "auth",
      query,
    }),
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
  let signer2 = (
    await SmartWeave.contracts.viewContractState(state.contracts.ethereum, {
      function: "verify712",
      data,
      signature,
    })
  ).result.signer
  const _signer = signer2.toLowerCase()
  if (_signer !== address.toLowerCase()) err()
  const link = state.auth.links[address.toLowerCase()]
  if (!isNil(link)) {
    let prev_expiry = is(Object, link) ? link.expiry || 0 : 0
    if (SmartWeave.block.timestamp < prev_expiry) {
      err("link already exists")
    }
  }
  state.auth.links[address.toLowerCase()] = {
    address: signer,
    expiry: expiry === 0 ? 0 : SmartWeave.block.timestamp + expiry,
  }
  return { state }
}
