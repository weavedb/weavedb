const { isNil } = require("ramda")
const { parse } = require("../../lib/utils")
const { err, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")
const { removeIndex: __removeIndex } = require("../../lib/index")

const removeIndex = async (
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
      "removeIndex",
      SmartWeave,
      true,
      kvs
    ))
  }
  let { new_data, path } = await parse(
    state,
    action,
    "removeIndex",
    signer,
    null,
    contractErr,
    SmartWeave,
    kvs
  )
  await __removeIndex(new_data, path, kvs, SmartWeave, signer)
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { removeIndex }
