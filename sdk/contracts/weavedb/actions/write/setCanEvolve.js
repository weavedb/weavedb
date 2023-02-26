const { err, isOwner } = require("../../lib/utils")
const { isNil, is } = require("ramda")
const { validate } = require("../../lib/validate")

const setCanEvolve = async (
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
      "setCanEvolve",
      SmartWeave
    ))
  }

  const owner = isOwner(signer, state)
  if (!is(Boolean)(action.input.query.value)) {
    err("Value must be a boolean.")
  }
  state.canEvolve = action.input.query.value
  return {
    state,
    result: {
      original_signer,
      transaction: SmartWeave.transaction,
      block: SmartWeave.block,
    },
  }
}

module.exports = { setCanEvolve }
