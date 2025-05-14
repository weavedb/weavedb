const {
  insert,
  last,
  isNil,
  mergeLeft,
  includes,
  difference,
  is,
} = require("ramda")
const { kv, parse, err, wrapResult } = require("../../lib/utils")
const { validate } = require("../../lib/validate")

const setRules = async (
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
      "setRules",
      SmartWeave,
      true,
      kvs,
    ))
  }
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "setRules",
    signer,
    null,
    contractErr,
    SmartWeave,
    kvs,
  )
  if (new_data.__op !== "del" && !is(Array, new_data)) {
    err("rules are not an array")
  }
  if (action.input.query.length % 2 === 1) {
    let __data = _data?.rules ?? []
    let [key, index] = last(action.input.query).split("@")
    if (is(Object, __data) && !is(Array, __data)) {
      err("the current rules is not an array")
    }
    let exists = false
    let left = []
    for (let [i, v] of __data.entries()) {
      if (v[0] === key) {
        exists = true
        index ??= i
      } else {
        left.push(v)
      }
    }
    if (!exists) index ??= __data.length
    if (!is(Number, +index)) err("index is not a number")
    _data.rules =
      new_data.__op === "del" ? left : insert(index, [key, new_data], left)
  } else {
    for (let k in new_data) {
      if (!is(Array, new_data[k])) err("rules are not an array")
    }
    _data.rules = new_data
  }

  await kv(kvs, SmartWeave).put(`data.${path.join("/")}`, _data)

  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { setRules }
