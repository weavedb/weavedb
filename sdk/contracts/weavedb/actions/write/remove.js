const { isNil, last, init } = require("ramda")
const { trigger, parse } = require("../../lib/utils")
const { err, wrapResult } = require("../../../common/lib/utils")
const { clone } = require("../../../common/lib/pure")
const { validate } = require("../../lib/validate")
const { removeData, getIndex } = require("../../lib/index")

const remove = async (
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
      "delete",
      SmartWeave
    ))
  }
  const { data, query, new_data, path, _data, col } = await parse(
    state,
    action,
    "delete",
    signer,
    0,
    contractErr,
    SmartWeave
  )
  if (isNil(_data.__data)) err(`Data doesn't exist`)
  let ind = getIndex(state, init(path))
  removeData(last(path), ind, col.__docs)
  let before = clone(_data.__data)
  let after = null
  _data.__data = null
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
