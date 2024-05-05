const { equals, isNil, init, last } = require("ramda")
const { kv, parse, trigger } = require("../../lib/utils")
const { validateSchema, wrapResult } = require("../../../common/lib/utils")
const { clone } = require("../../../common/lib/pure")
const { validate } = require("../../lib/validate")
const { updateData, addData } = require("../../lib/index")

const upsert = async (
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
      "upsert",
      SmartWeave,
      true,
      kvs
    ))
  }
  let { data, query, _signer, new_data, path, schema, _data, col, next_data } =
    await parse(
      state,
      action,
      "upsert",
      signer,
      0,
      contractErr,
      SmartWeave,
      kvs
    )
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
  const updated = !equals(_data.__data, next_data)
  let before = clone(_data.__data)
  let after = clone(next_data)
  _data.__data = next_data
  await kv(kvs, SmartWeave).put(`data.${path.join("/")}`, _data)

  if (updated && depth < 10) {
    state = await trigger(
      [isNil(before) ? "craete" : "update"],
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
module.exports = { upsert }
