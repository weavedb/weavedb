const { insert, findIndex, propEq, isNil } = require("ramda")
const { err, wrapResult, parse } = require("../../lib/utils")
const { validate } = require("../../lib/validate")

const addTrigger = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth = 1,
  type = "direct",
) => {
  if ((state.bundlers ?? []).length !== 0 && type === "direct") {
    err("only bundle queries are allowed")
  }

  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "addTrigger",
      SmartWeave,
      true,
      kvs,
    ))
  }
  let { col, _data, data, query, new_data, path } = await parse(
    state,
    action,
    "addTrigger",
    signer,
    null,
    contractErr,
    SmartWeave,
    kvs,
  )
  const trigger_key = `trigger.${path.join("/")}`
  state.triggers ??= {}
  state.triggers[trigger_key] ??= []
  let { index, key, on, func, version } = action.input.query[0]
  const _index = findIndex(propEq("key", key), state.triggers[trigger_key])
  version ??= 1
  if (_index !== -1) {
    state.triggers[trigger_key][_index] = { key, on, func, version }
  } else if (isNil(index)) {
    state.triggers[trigger_key].push({ key, on, func, version })
  } else {
    state.triggers[trigger_key] = insert(
      index,
      { key, on, func, version },
      state.triggers[trigger_key],
    )
  }
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { addTrigger }
