const { isNil, init, last } = require("ramda")
const { parse, clone, validateSchema } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { updateData, addData, getIndex } = require("../../lib/index")

const upsert = async (
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
      "upsert",
      SmartWeave
    ))
  }
  let { data, query, _signer, new_data, path, schema, _data, col, next_data } =
    await parse(state, action, "upsert", signer, 0, contractErr, SmartWeave)
  let prev = clone(_data.__data)
  validateSchema(schema, next_data, contractErr)
  let ind = getIndex(state, init(path))
  const db = async id => {
    const doc_key = `data.${path.slice(0, -1).join("/")}/${id}`
    return (await SmartWeave.kv.get(doc_key)) || { __data: null, subs: {} }
  }
  if (isNil(prev)) {
    await addData(last(path), next_data, ind, db)
  } else {
    await updateData(last(path), next_data, prev, ind, db)
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
module.exports = { upsert }
