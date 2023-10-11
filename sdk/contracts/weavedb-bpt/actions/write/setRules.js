const {
  insert,
  last,
  isNil,
  mergeLeft,
  includes,
  difference,
  is,
} = require("ramda")
const { kv, parse } = require("../../lib/utils")
const { err, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")
const jsonLogic = require("json-logic-js")

const setRules = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth = 1,
  type = "direct"
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
      kvs
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
    kvs
  )
  if (action.input.query.length % 2 === 1) {
    let __data = _data?.rules ?? []
    let [key, index] = last(action.input.query).split("@")
    if (is(Object, data) && !is(Array, data)) {
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
    if (new_data.__op !== "del" && !is(Array, new_data)) {
      err("rules are not an array")
    }
    _data.rules =
      new_data.__op === "del" ? left : insert(index, [key, new_data], left)
  } else {
    for (let k in new_data) {
      if (!is(Array, new_data[k])) {
        const keys = k.split(" ")
        const permission = keys[0]
        if (keys.length !== 2 && permission !== "let") err()
        if (!includes(permission)(["allow", "deny", "let"])) err()
        if (
          permission !== "let" &&
          !is(Boolean)(jsonLogic.apply(new_data[k], {}))
        ) {
          err()
        }
      }
    }
    _data.rules = new_data
  }

  await kv(kvs, SmartWeave).put(`data.${path.join("/")}`, _data)

  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { setRules }
