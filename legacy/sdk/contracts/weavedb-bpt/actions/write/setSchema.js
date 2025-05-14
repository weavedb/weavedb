const { isNil, mergeLeft } = require("ramda")
const { kv, err, parse, wrapResult } = require("../../lib/utils")
const { clone } = require("../../lib/pure")
const { validate } = require("../../lib/validate")
const { validate: validator } = require("../../lib/jsonschema")

const setSchema = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth = 1,
  type = "direct",
) => {
  if ((state.bundlers ?? []).length !== 0 && type === "direct") {
    err("only bundle queries are allowed")
  }

  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "setSchema",
      SmartWeave,
      true,
      kvs,
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
    kvs,
  )
  _data.schema = new_data
  try {
    const { error } = await validator(
      undefined,
      clone(_data.schema),
      state,
      SmartWeave,
    )
    if (error) err("schema error")
  } catch (e) {
    err("schema error")
  }
  await kv(kvs, SmartWeave).put(`data.${path.join("/")}`, _data)
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { setSchema }
