const { isNil, init, last } = require("ramda")
const { parse, trigger } = require("../../lib/utils")
const { err, validateSchema, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")
const { put } = require("../../lib/index")

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
      SmartWeave,
      true,
      kvs
    ))
  }
  let { _data, path, schema, next_data } = await parse(
    state,
    action,
    "add",
    signer,
    salt,
    contractErr,
    SmartWeave,
    kvs
  )
  if (!isNil(_data.__data)) err("doc already exists")
  validateSchema(schema, next_data, contractErr)
  let { before, after } = await put(
    next_data,
    last(path),
    init(path),
    kvs,
    SmartWeave,
    signer
  )
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
        data: {
          before: before.val,
          after: after.val,
          id: last(path),
          setter: _data.setter,
        },
      }
    )
  }
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { add }
