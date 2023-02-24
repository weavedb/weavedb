const { o, flatten, isNil, mergeLeft, includes, init } = require("ramda")
const { parse } = require("../../lib/utils")
const { err } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { addIndex: _addIndex, getIndex } = require("../../lib/index")

const addIndex = async (
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
      "addIndex",
      SmartWeave
    ))
  }
  let { col, _data, data, query, new_data, path } = await parse(
    state,
    action,
    "addIndex",
    signer,
    null,
    contractErr,
    SmartWeave
  )
  let ind = getIndex(state, path)
  if (o(includes("__id__"), flatten)(new_data)) {
    err("index cannot contain __id__")
  }
  _addIndex(new_data, ind, col.__docs)
  return { state, result: { original_signer } }
}

module.exports = { addIndex }
