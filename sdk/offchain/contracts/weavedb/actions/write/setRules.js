const { isNil, mergeLeft, includes, difference, is } = require("ramda")
const { err, parse, mergeData } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const jsonLogic = require("json-logic-js")

const setRules = async (
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
      "setRules",
      SmartWeave
    ))
  }
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "setRules",
    signer,
    null,
    contractErr,
    SmartWeave
  )
  for (let k in new_data) {
    const keys = k.split(" ")
    const permission = keys[0]
    if (keys.length !== 2 && permission !== "let") err()
    if (!includes(permission)(["allow", "deny", "let"])) err()
    if (keys.length === 2) {
      const ops = keys[1].split(",")
      if (difference(ops, ["write", "create", "update", "delete"]).length > 0) {
        err()
      }
    }
    if (
      permission !== "let" &&
      !is(Boolean)(jsonLogic.apply(new_data[k], {}))
    ) {
      err()
    }
  }
  _data.rules = new_data
  return {
    state,
    result: {
      original_signer,
      transaction: SmartWeave.transaction,
      block: SmartWeave.block,
    },
  }
}

module.exports = { setRules }
