const { equals, includes, isNil, init, last } = require("ramda")
const { kv, parse, trigger } = require("../../lib/utils")
const { err, validateSchema, wrapResult } = require("../../../common/lib/utils")
const { clone } = require("../../../common/lib/pure")
const { validate } = require("../../lib/validate")
const { updateData } = require("../../lib/index")
const { put } = require("../../lib/Collection")
const update = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth = 1
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "update",
      SmartWeave,
      true,
      kvs
    ))
  }
  let { data, query, new_data, path, _data, schema, col, next_data } =
    await parse(
      state,
      action,
      "update",
      signer,
      0,
      contractErr,
      SmartWeave,
      kvs
    )
  if (isNil(_data.__data)) err(`Data doesn't exist`)
  let prev = clone(_data.__data)
  validateSchema(schema, next_data, contractErr)
  const db = async id => {
    const doc_key = `data.${path.slice(0, -1).join("/")}/${id}`
    return (
      (await kv(kvs, SmartWeave).get(doc_key)) || { __data: null, subs: {} }
    )
  }
  await updateData(last(path), next_data, prev, db, init(path), SmartWeave, kvs)
  const updated = !equals(_data.__data, next_data)
  let before = clone(_data.__data)
  let after = clone(next_data)
  _data.__data = next_data
  await kv(kvs, SmartWeave).put(`data.${path.join("/")}`, _data)
  //await put(next_data, last(path), init(path), kvs, SmartWeave, signer)
  if (updated && depth < 10) {
    await trigger(
      ["update"],
      state,
      path,
      SmartWeave,
      kvs,
      executeCron,
      depth,
      {
        data: { before, after, id: last(path), setter: _data.setter },
      }
    )
  }
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { update }
