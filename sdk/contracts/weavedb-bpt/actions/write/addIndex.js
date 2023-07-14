const { o, flatten, isNil, mergeLeft, includes, init } = require("ramda")
const { kv, parse } = require("../../lib/utils")
const { err, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")
const { addIndex: _addIndex, getIndex } = require("../../lib/index")
const { addIndex: __addIndex } = require("../../lib/Collection")

const addIndex = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "addIndex",
      SmartWeave,
      true,
      kvs
    ))
  }
  let { col, _data, data, query, new_data, path } = await parse(
    state,
    action,
    "addIndex",
    signer,
    null,
    contractErr,
    SmartWeave,
    kvs
  )
  if (o(includes("__id__"), flatten)(new_data)) {
    err("index cannot contain __id__")
  }
  const db = async id => {
    const doc_key = `data.${path.join("/")}/${id}`
    return (
      (await kv(kvs, SmartWeave).get(doc_key)) || { __data: null, subs: {} }
    )
  }
  await _addIndex(new_data, path, db, SmartWeave, kvs)
  await __addIndex(new_data, path, kvs, SmartWeave, signer)
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { addIndex }
