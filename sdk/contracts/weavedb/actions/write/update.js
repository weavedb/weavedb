const { isNil, init, last } = require("ramda")
const {
  wrapResult,
  err,
  clone,
  parse,
  validateSchema,
} = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { updateData, getIndex } = require("../../lib/index")

const update = async (
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
      "update",
      SmartWeave
    ))
  }
  let { data, query, new_data, path, _data, schema, col, next_data } =
    await parse(state, action, "update", signer, 0, contractErr, SmartWeave)
  if (isNil(_data.__data)) err(`Data doesn't exist`)
  let prev = clone(_data.__data)
  validateSchema(schema, next_data, contractErr)
  let ind = getIndex(state, init(path))
  updateData(last(path), next_data, prev, ind, col.__docs)
  _data.__data = next_data
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { update }
