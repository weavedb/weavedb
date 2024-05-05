const { isNil, over, lensPath, append, init, last } = require("ramda")
const { parse, kv, trigger } = require("../../lib/utils")
const { clone } = require("../../../common/lib/pure")
const { err, validateSchema, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")
const { addData } = require("../../lib/index")

const add = async (
  state,
  action,
  signer,
  salt = 0,
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

module.exports = { add }
