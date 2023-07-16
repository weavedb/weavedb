const { isNil } = require("ramda")
const { parse } = require("../../lib/utils")
const { wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")
const { removeIndex: __removeIndex } = require("../../lib/index")

const removeIndex = async (
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
