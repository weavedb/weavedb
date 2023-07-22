const { err, isOwner, wrapResult } = require("../../../common/lib/utils")
const { isNil, without, includes, is, of } = require("ramda")
const { validate } = require("../../lib/validate")

const removeOwner = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth = 1,
  type = "direct"
) => {
  if ((state.bundlers ?? []).length !== 0 && type === "direct") {
    err("only bundle queries are allowed")
  }

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
