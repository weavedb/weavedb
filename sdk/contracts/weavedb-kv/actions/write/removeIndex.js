const { isNil, mergeLeft, init } = require("ramda")
const { wrapResult, err, parse, mergeData } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { removeIndex: _removeIndex, getIndex } = require("../../lib/index")

const removeIndex = async (
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
      "removeIndex",
      SmartWeave
    ))
  }
  let { col, _data, data, query, new_data, path } = await parse(
    state,
    action,
    "removeIndex",
    signer,
    null,
    contractErr,
    SmartWeave
  )
  await _removeIndex(new_data, path, SmartWeave)
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { removeIndex }
