const { err, isOwner, wrapResult } = require("../../../common/lib/utils")
const { includes, is, of, append, isNil } = require("ramda")
const { validate } = require("../../lib/validate")

const addOwner = async (
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
      "addOwner",
      SmartWeave,
      true,
      kvs
    ))
  }

  const owner = isOwner(signer, state)

  if (!is(String)(action.input.query.address)) err("Value must be string.")

  if (includes(action.input.query.address, owner)) {
    err("The owner already exists.")
  }
  state.owner = append(action.input.query.address, owner)
  return wrapResult(state, original_signer, SmartWeave)
}
module.exports = { addOwner }
