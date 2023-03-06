const { isNil, init, last } = require("ramda")
const { err, clone, parse, validateSchema } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { updateData, getIndex } = require("../../lib/index")

const update = async (
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
      "update",
      SmartWeave
    ))
  }
  let { data, query, new_data, path, _data, schema, col, next_data } =
    await parse(state, action, "update", signer, 0, contractErr, SmartWeave)
  if (isNil(_data.__data)) err(`Data doesn't exist`)
  let prev = clone(_data.__data)
  validateSchema(schema, next_data, contractErr)
  let ind = getIndex(state, init(path))
  const db = async id => {
    const doc_key = `data.${path.slice(0, -1).join("/")}/${id}`
    return (await SmartWeave.kv.get(doc_key)) || { __data: null, subs: {} }
  }
  await updateData(last(path), next_data, prev, ind, db)
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

module.exports = { update }
