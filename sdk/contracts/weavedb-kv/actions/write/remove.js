const { isNil, last, init } = require("ramda")
const { parse } = require("../../lib/utils")
const { err } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { removeData, getIndex } = require("../../lib/index")

const remove = async (
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
  _data.__data = null
  return {
    state,
    result: {
      original_signer,
      transaction: SmartWeave.transaction,
      block: SmartWeave.block,
    },
  }
}

module.exports = { remove }
