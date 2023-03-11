const { init, last, isNil, clone } = require("ramda")
const { err, wrapResult, parse, validateSchema } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { updateData, addData, getIndex } = require("../../lib/index")

const set = async (state, action, signer, contractErr = true, SmartWeave) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "set",
      SmartWeave
    ))
  }
  let { _data, data, query, new_data, path, schema, col, next_data } =
    await parse(state, action, "set", signer, 0, contractErr, SmartWeave)
  let prev = clone(_data.__data)
  validateSchema(schema, next_data, contractErr)
  let ind = getIndex(state, init(path))
  if (isNil(prev)) {
    addData(last(path), next_data, ind, col.__docs)
  } else {
    updateData(last(path), next_data, prev, ind, col.__docs)
  }
  _data.__data = next_data
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { set }
