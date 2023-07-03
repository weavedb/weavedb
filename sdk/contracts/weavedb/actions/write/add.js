const { isNil, over, lensPath, append, init, last } = require("ramda")
const { err, validateSchema, wrapResult } = require("../../../common/lib/utils")
const { clone } = require("../../../common/lib/pure")
const { trigger, parse, getCol } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { addData, getIndex } = require("../../lib/index")
const add = async (
  state,
  action,
  signer,
  salt = 0,
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
      "add",
      SmartWeave
    ))
  }
  let { _data, data, query, new_data, path, schema, col, next_data } =
    await parse(state, action, "add", signer, salt, contractErr, SmartWeave)
  if (!isNil(_data.__data)) err("doc already exists")
  validateSchema(schema, next_data, contractErr)
  let ind = getIndex(state, init(path))
  addData(last(path), next_data, ind, col.__docs)
  let before = clone(_data.__data)
  let after = clone(next_data)
  _data.__data = next_data
  if (depth < 10) {
    state = await trigger(
      "create",
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

module.exports = { add }
