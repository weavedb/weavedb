const { isNil, mergeLeft, init } = require("ramda")
const { parse } = require("../../lib/utils")
const { err, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")
const { removeIndex: _removeIndex, getIndex } = require("../../lib/index")
const { removeIndex: __removeIndex } = require("../../lib/Collection")

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
  let { col, _data, data, query, new_data, path } = await parse(
    state,
    action,
    "removeIndex",
    signer,
    null,
    contractErr,
    SmartWeave,
    kvs
  )
  await _removeIndex(new_data, path, SmartWeave, kvs)
  await __removeIndex(new_data, path, kvs, SmartWeave, signer)
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { removeIndex }
