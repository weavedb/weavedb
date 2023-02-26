const { is, isNil } = require("ramda")
const { validate } = require("../../lib/validate")
const { err } = require("../../lib/utils")

const removeAddressLink = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "removeAddressLink",
      SmartWeave
    ))
  }
  const { address } = action.input.query
  const link = state.auth.links[address.toLowerCase()]
  if (isNil(link)) err("link doesn't exist")
  let _address = is(Object, link) ? link.address : link
  if (signer !== address.toLowerCase() && signer !== _address) {
    err("signer is neither owner nor delegator")
  }
  delete state.auth.links[address.toLowerCase()]
  return {
    state,
    result: {
      original_signer,
      transaction: SmartWeave.transaction,
      block: SmartWeave.block,
    },
  }
}

module.exports = { removeAddressLink }
