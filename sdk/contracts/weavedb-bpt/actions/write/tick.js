const { isNil, init, last } = require("ramda")
const { err, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")

const tick = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth = 1,
  type = "direct",
  get,
  count = 0
) => {
  if (count === 0) err("no crons executed")
  if ((state.bundlers ?? []).length !== 0 && type === "direct") {
    err("only bundle queries are allowed")
  }

  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "tick",
      SmartWeave,
      true,
      kvs
    ))
  }

  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { tick }
