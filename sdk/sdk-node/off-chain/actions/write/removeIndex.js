const { isNil, mergeLeft, init } = require("ramda")
const { parse, mergeData } = require("../../lib/utils")
const { err } = require("../../lib/utils")
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
  let ind = getIndex(state, path)
  _removeIndex(new_data, ind, col.__docs)
  return { state, result: { original_signer } }
}

module.exports = { removeIndex }
