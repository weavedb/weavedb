const { is, isNil } = require("ramda")
const { err, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")

const addAddressLink = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  _linkTo
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "addAddressLink",
      SmartWeave
    ))
  }
  const { address, signature, expiry, linkTo } = action.input.query
  if ((!isNil(linkTo) || !isNil(_linkTo)) && linkTo !== _linkTo)
    err("linkTo doesn't match")
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
  let query =
    typeof expiry === "undefined"
      ? { address: signer }
      : { address: signer, expiry }
  if (!isNil(linkTo)) query.linkTo = linkTo
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
    address: linkTo || signer,
    expiry: expiry === 0 ? 0 : SmartWeave.block.timestamp + expiry,
  }
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { addAddressLink }
