import { isNil, clone } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { set } from "./set"
import { add } from "./add"
import { update } from "./update"
import { upsert } from "./upsert"
import { remove } from "./remove"

export const batch = async (state, action) => {
  const signer = validate(state, action, "batch")
  let _state = state
  let i = 0
  for (let v of action.input.query) {
    let [op, ...query] = v
    const _action = { input: { function: op, query }, caller: action.caller }
    let res = null
    switch (op) {
      case "add":
        res = await add(_state, _action, signer, i)
        break
      case "set":
        res = await set(_state, _action, signer)
        break
      case "update":
        res = await update(_state, _action, signer)
        break
      case "upsert":
        res = await upsert(_state, _action, signer)
        break
      case "delete":
        res = await remove(_state, _action, signer)
        break
      default:
        err(`No function supplied or function not recognised: "${op}"`)
    }
    _state = res.state
    i++
  }
  return { state: _state }
}
