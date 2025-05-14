const { err, isOwner, wrapResult } = require("../../lib/utils")
const { isNil, is } = require("ramda")
const { validate } = require("../../lib/validate")

const setSecure = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth = 1,
  type = "direct",
) => {
  if ((state.bundlers ?? []).length !== 0 && type === "direct") {
    err("only bundle queries are allowed")
  }

  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "setSecure",
      SmartWeave,
      true,
      kvs,
    ))
  }
  const owner = isOwner(signer, state)

  if (!is(Boolean)(action.input.query.value)) err("Value must be a boolean.")

  state.secure = action.input.query.value
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { setSecure }
