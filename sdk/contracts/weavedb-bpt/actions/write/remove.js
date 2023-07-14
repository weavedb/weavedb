const { isNil, last, init } = require("ramda")
const { kv, parse, trigger } = require("../../lib/utils")
const { clone } = require("../../../common/lib/pure")
const { err, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")
const { removeData, getIndex } = require("../../lib/index")
const { del } = require("../../lib/Collection")

const remove = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "delete",
      SmartWeave,
      true,
      kvs
    ))
  }
  const { data, query, new_data, path, _data, col } = await parse(
    state,
    action,
    "delete",
    signer,
    0,
    contractErr,
    SmartWeave,
    kvs
  )
  if (isNil(_data.__data)) err(`Data doesn't exist`)
  const db = async id => {
    const doc_key = `data.${path.slice(0, -1).join("/")}/${id}`
    return (
      (await kv(kvs, SmartWeave).get(doc_key)) || { __data: null, subs: {} }
    )
  }
  await removeData(last(path), db, init(path), SmartWeave, kvs)
  let before = clone(_data.__data)
  let after = null
  _data.__data = null
  await kv(kvs, SmartWeave).put(`data.${path.join("/")}`, _data)
  await del(last(path), init(path), kvs, SmartWeave, signer)
  if (depth < 10) {
    await trigger(
      ["delete"],
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

module.exports = { remove }
