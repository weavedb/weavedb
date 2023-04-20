const { isNil, over, lensPath, append, init, last } = require("ramda")
const { clone, kv } = require("../../lib/utils")
const {
  err,
  parse,
  mergeData,
  validateSchema,
  wrapResult,
} = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { addData } = require("../../lib/index")
const add = async (
  state,
  action,
  signer,
  salt = 0,
  contractErr = true,
  SmartWeave,
  kvs
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
  let { _data, data, query, new_data, path, schema, col, next_data } =
    await parse(
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
  const db = async id => {
    const doc_key = `data.${path.slice(0, -1).join("/")}/${id}`
    return (
      (await kv(kvs, SmartWeave).get(doc_key)) || { __data: null, subs: {} }
    )
  }
  await addData(last(path), next_data, db, init(path), SmartWeave, kvs)
  let before = clone(_data.__data)
  let after = clone(next_data)
  _data.__data = next_data
  await kv(kvs, SmartWeave).put(`data.${path.join("/")}`, _data)
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { add }
