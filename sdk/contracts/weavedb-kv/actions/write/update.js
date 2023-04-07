const { isNil, init, last } = require("ramda")
const {
  wrapResult,
  err,
  clone,
  parse,
  validateSchema,
} = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { updateData } = require("../../lib/index")

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
  const db = async id => {
    const doc_key = `data.${path.slice(0, -1).join("/")}/${id}`
    return (await SmartWeave.kv.get(doc_key)) || { __data: null, subs: {} }
  }
  await updateData(last(path), next_data, prev, db, init(path), SmartWeave)

  _data.__data = next_data
  await SmartWeave.kv.put(`data.${path.join("/")}`, _data)
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { update }
