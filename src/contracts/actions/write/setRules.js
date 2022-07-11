import { isNil, mergeLeft, includes, difference, is } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { validator } from "@exodus/schemasafe"
import jsonLogic from "json-logic-js"
export const setRules = async (state, action, signer) => {
  signer ||= validate(state, action, "setRules")
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "setRules",
    signer
  )
  for (let k in new_data) {
    const keys = k.split(" ")
    if (keys.length !== 2) err()
    const permission = keys[0]
    if (!includes(permission)(["allow", "deny"])) err()
    const ops = keys[1].split(",")
    if (difference(ops, ["write", "create", "update", "delete"]).length > 0) {
      err()
    }
    if (!is(Boolean)(jsonLogic.apply(new_data[k], {}))) err()
  }
  _data.rules = new_data
  return { state }
}
