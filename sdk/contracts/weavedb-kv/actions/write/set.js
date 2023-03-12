const { init, last, isNil, clone } = require("ramda")
const { parse, validateSchema } = require("../../lib/utils")
const { err } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { updateData, addData, getIndex } = require("../../lib/index")

const set = async (state, action, signer, contractErr = true, SmartWeave) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "set",
      SmartWeave
    ))
  }
  let { _data, data, query, new_data, path, schema, col, next_data } =
    await parse(state, action, "set", signer, 0, contractErr, SmartWeave)
  let prev = clone(_data.__data)
  validateSchema(schema, next_data, contractErr)
  const db = async id => {
    const doc_key = `data.${path.slice(0, -1).join("/")}/${id}`
    return (await SmartWeave.kv.get(doc_key)) || { __data: null, subs: {} }
  }
  if (isNil(prev)) {
    await addData(last(path), next_data, db, init(path), SmartWeave)
  } else {
    await updateData(last(path), next_data, prev, db, init(path), SmartWeave)
  }
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

module.exports = { set }
