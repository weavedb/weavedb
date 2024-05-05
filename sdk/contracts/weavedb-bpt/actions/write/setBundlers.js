const { err, isOwner, wrapResult } = require("../../../common/lib/utils")
const { includes, is, of, append, isNil } = require("ramda")
const { validate } = require("../../lib/validate")

const setBundlers = async (
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
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "setBundlers",
      SmartWeave,
      true,
      kvs
    ))
  }

  const owner = isOwner(signer, state)

  if (!is(Array)(action.input.query.bundlers)) err("Value must be an array.")
  state.bundlers = action.input.query.bundlers
  return wrapResult(state, original_signer, SmartWeave)
}
module.exports = { setBundlers }
