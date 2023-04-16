const { wrapResult, err, isOwner } = require("../../lib/utils")
const { isNil, without, includes, is, of } = require("ramda")
const { validate } = require("../../lib/validate")

const removeOwner = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "removeOwner",
      SmartWeave,
      true,
      kvs
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
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { removeOwner }
