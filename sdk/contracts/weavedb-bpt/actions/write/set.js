const { includes, init, last, isNil } = require("ramda")
const { kv, parse, trigger } = require("../../lib/utils")
const { err, validateSchema, wrapResult } = require("../../../common/lib/utils")
const { clone } = require("../../../common/lib/pure")
const { validate } = require("../../lib/validate")
const { updateData, addData, getIndex } = require("../../lib/index")
const { put } = require("../../lib/Collection")
const set = async (
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
      "set",
      SmartWeave,
      true,
      kvs
    ))
  }
  let { _data, data, query, new_data, path, schema, col, next_data } =
    await parse(state, action, "set", signer, 0, contractErr, SmartWeave, kvs)
  let prev = clone(_data.__data)
  validateSchema(schema, next_data, contractErr)
  const db = async id => {
    const doc_key = `data.${path.slice(0, -1).join("/")}/${id}`
    return (
      (await kv(kvs, SmartWeave).get(doc_key)) || { __data: null, subs: {} }
    )
  }
  if (isNil(prev)) {
    await addData(last(path), next_data, db, init(path), SmartWeave, kvs)
  } else {
    await updateData(
      last(path),
      next_data,
      prev,
      db,
      init(path),
      SmartWeave,
      kvs
    )
  }
  let before = clone(_data.__data)
  let after = clone(next_data)
  _data.__data = next_data
  await kv(kvs, SmartWeave).put(`data.${path.join("/")}`, _data)
  await put(next_data, last(path), init(path), kvs, SmartWeave, signer, true)
  if (depth < 10) {
    state = await trigger(
      "create",
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

module.exports = { set }
