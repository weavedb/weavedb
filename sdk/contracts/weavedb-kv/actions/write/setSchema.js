const { isNil, mergeLeft } = require("ramda")
const { kv, err, parse } = require("../../lib/utils")
const { clone } = require("../../../common/lib/pure")
const { wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")
const { validate: validator } = require("../../../common/lib/jsonschema")

const setSchema = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "setSchema",
      SmartWeave,
      true,
      kvs
    ))
  }
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "setSchema",
    signer,
    null,
    contractErr,
    SmartWeave,
    kvs
  )
  _data.schema = new_data
  try {
    validator(undefined, clone(_data.schema))
  } catch (e) {
    err("schema error")
  }
  await kv(kvs, SmartWeave).put(`data.${path.join("/")}`, _data)
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { setSchema }
