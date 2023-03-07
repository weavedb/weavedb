const { isNil, over, lensPath, append, init, last } = require("ramda")
const { err, parse, mergeData, validateSchema } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { addData } = require("../../lib/index")
const add = async (
  state,
  action,
  signer,
  salt = 0,
  contractErr = true,
  SmartWeave
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
  const db = async id => {
    const doc_key = `data.${path.slice(0, -1).join("/")}/${id}`
    return (await SmartWeave.kv.get(doc_key)) || { __data: null, subs: {} }
  }
  await addData(last(path), next_data, db, init(path), SmartWeave)
  _data.__data = next_data
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

module.exports = { add }
