const { err, isOwner } = require("../../lib/utils")
const { includes, is, of, append, isNil } = require("ramda")
const { validate } = require("../../lib/validate")

const addOwner = async (
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
      "addOwner",
      SmartWeave
    ))
  }

  const owner = isOwner(signer, state)
  if (!is(String)(action.input.query.address)) {
    err("Value must be string.")
  }

  if (!is(String)(action.input.query.address)) {
    err("Value must be string.")
  }
  if (includes(action.input.query.address, owner)) {
    err("The owner already exists.")
  }
  state.owner = append(action.input.query.address, owner)
  return {
    state,
    result: {
      original_signer,
      transaction: SmartWeave.transaction,
      block: SmartWeave.block,
    },
  }
}
module.exports = { addOwner }
