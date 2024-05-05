const { equals, isNil, init, last } = require("ramda")
const { trigger, parse } = require("../../lib/utils")
const { err, validateSchema, wrapResult } = require("../../../common/lib/utils")
const { clone } = require("../../../common/lib/pure")
const { validate } = require("../../lib/validate")
const { updateData, getIndex } = require("../../lib/index")

const update = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth = 1
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
  const updated = !equals(_data.__data, next_data)
  let before = clone(_data.__data)
  let after = clone(next_data)
  _data.__data = next_data
  if (updated && depth < 10) {
    await trigger(
      ["update"],
      state,
      path,
      SmartWeave,
      kvs,
      executeCron,
      depth,
      {
        data: { before, after, id: last(path), setter: _data.setter },
      }
    )
  }

  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { update }
