const { equals, isNil, init, last } = require("ramda")
const { parse, trigger } = require("../../lib/utils")
const { validateSchema, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")
const { put } = require("../../lib/index")

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
      SmartWeave,
      true,
      kvs
    ))
  }
  let { data, query, _signer, new_data, path, schema, _data, col, next_data } =
    await parse(
      state,
      action,
      "upsert",
      signer,
      0,
      contractErr,
      SmartWeave,
      kvs
    )
  validateSchema(schema, next_data, contractErr)
  _data.__data = next_data
  let { before, after } = await put(
    next_data,
    last(path),
    init(path),
    kvs,
    SmartWeave,
    signer
  )
  const updated = !equals(before.val, after.val)
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
module.exports = { upsert }
