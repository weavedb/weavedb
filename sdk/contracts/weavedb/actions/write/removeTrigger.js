const { insert, findIndex, propEq, isNil } = require("ramda")
const { parse } = require("../../lib/utils")
const { err, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")

const removeTrigger = async (
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
      "removeTrigger",
      SmartWeave,
      true,
      kvs
    ))
  }
  let { col, _data, data, query, new_data, path } = await parse(
    state,
    action,
    "removeTrigger",
    signer,
    null,
    contractErr,
    SmartWeave,
    kvs
  )
  const trigger_key = `trigger.${path.join("/")}`
  state.triggers ??= {}
  state.triggers[trigger_key] ??= []
  let key = action.input.query[0]
  const _index = findIndex(propEq("key", key), state.triggers[trigger_key])
  if (_index !== -1) {
    state.triggers[trigger_key].splice(_index, 1)
  } else {
    err("trigger doesn't exist")
  }
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { removeTrigger }
