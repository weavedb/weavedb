const { equals, isNil, init, last } = require("ramda")
const { parse, trigger } = require("../../lib/utils")
const { validateSchema, wrapResult } = require("../../../common/lib/utils")
const { clone } = require("../../../common/lib/pure")
const { validate } = require("../../lib/validate")
const { updateData, addData, getIndex } = require("../../lib/index")

const upsert = async (
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
      "upsert",
      SmartWeave
    ))
  }
  let { data, query, _signer, new_data, path, schema, _data, col, next_data } =
    await parse(state, action, "upsert", signer, 0, contractErr, SmartWeave)
  let prev = clone(_data.__data)
  validateSchema(schema, next_data, contractErr)
  let ind = getIndex(state, init(path))
  if (isNil(prev)) {
    addData(last(path), next_data, ind, col.__docs)
  } else {
    updateData(last(path), next_data, prev, ind, col.__docs)
  }
  const updated = !equals(_data.__data, next_data)
  let before = clone(_data.__data)
  let after = clone(next_data)
  _data.__data = next_data
  if (updated && depth < 10) {
    state = await trigger(
      [isNil(before) ? "craete" : "update"],
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

module.exports = { upsert }
