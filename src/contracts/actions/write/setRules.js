import { isNil, mergeLeft, includes, difference, is } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { validator } from "@exodus/schemasafe"
import jsonLogic from "json-logic-js"
export const setRules = async (state, action, signer) => {
  signer ||= await validate(state, action, "setRules")
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "setRules",
    signer
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
  return { state }
}
