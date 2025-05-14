const { o, flatten, isNil, mergeLeft, includes } = require("ramda")
const { err, wrapResult, parse } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { addIndex: __addIndex } = require("../../lib/index")

const addIndex = async (
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
      "addIndex",
      SmartWeave,
      true,
      kvs,
    ))
  }
  let { new_data, path } = await parse(
    state,
    action,
    "addIndex",
    signer,
    null,
    contractErr,
    SmartWeave,
    kvs,
  )
  if (o(includes("__id__"), flatten)(new_data)) {
    err("index cannot contain __id__")
  }
  await __addIndex(new_data, path, kvs, SmartWeave, signer)
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { addIndex }
