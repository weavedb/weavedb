const { err, isOwner } = require("../../lib/utils")
const { isNil, without, includes, is, of } = require("ramda")
const { validate } = require("../../lib/validate")

const removeOwner = async (
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
      "removeOwner",
      SmartWeave
    ))
  }
  const owner = isOwner(signer, state)

  if (!is(String)(action.input.query.address)) {
    err("Value must be string.")
  }

  if (!includes(action.input.query.address, owner)) {
    err("The owner doesn't exist.")
  }
  state.owner = without([action.input.query.address], owner)
  return { state, result: { original_signer } }
}

module.exports = { removeOwner }
