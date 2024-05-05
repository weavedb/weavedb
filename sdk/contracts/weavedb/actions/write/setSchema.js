const { isNil, mergeLeft } = require("ramda")
const { parse } = require("../../lib/utils")
const { clone } = require("../../../common/lib/pure")
const { err, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")
const { validate: validator } = require("../../../common/lib/jsonschema")

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
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { setSchema }
