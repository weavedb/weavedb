const { isNil, mergeLeft } = require("ramda")
const { clone, parse, mergeData } = require("../../lib/utils")
const { err } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { validate: validator } = require("../../lib/jsonschema")

const setSchema = async (
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
      "setSchema",
      SmartWeave
    ))
  }
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "setSchema",
    signer,
    null,
    contractErr,
    SmartWeave
  )
  _data.schema = new_data
  try {
    validator(undefined, clone(_data.schema))
  } catch (e) {
    err("schema error")
  }
  await SmartWeave.kv.put(`data.${path.join("/")}`, _data)
  return {
    state,
    result: {
      original_signer,
      transaction: SmartWeave.transaction,
      block: SmartWeave.block,
    },
  }
}

module.exports = { setSchema }
