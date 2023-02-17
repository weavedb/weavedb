const { isNil, init, last } = require("ramda")
const { parse, clone, mergeData, validateSchema } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { updateData, addData, getIndex } = require("../../lib/index")

const upsert = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave
) => {
  signer ||= await validate(state, action, "upsert", SmartWeave)
  let { data, query, _signer, new_data, path, schema, _data, col, next_data } =
    await parse(state, action, "upsert", signer, 0, contractErr)
  let prev = clone(_data.__data)
  validateSchema(schema, next_data, contractErr)
  let ind = getIndex(state, init(path))
  if (isNil(prev)) {
    addData(last(path), next_data, ind, col.__docs)
  } else {
    updateData(last(path), next_data, prev, ind, col.__docs)
  }
  _data.__data = next_data
  return { state }
}
module.exports = { upsert }
