import { err } from "./lib/utils"
import { mergeLeft } from "ramda"

import { nonce } from "./actions/read/nonce"
import { ids } from "./actions/read/ids"
import { get } from "./actions/read/get"
import { getSchema } from "./actions/read/getSchema"
import { getRules } from "./actions/read/getRules"
import { getIndexes } from "./actions/read/getIndexes"

import { add } from "./actions/write/add"
import { set } from "./actions/write/set"
import { update } from "./actions/write/update"
import { upsert } from "./actions/write/upsert"
import { remove } from "./actions/write/remove"
import { batch } from "./actions/write/batch"
import { addIndex } from "./actions/write/addIndex"
import { removeIndex } from "./actions/write/removeIndex"
import { setSchema } from "./actions/write/setSchema"
import { setRules } from "./actions/write/setRules"
import { evolve } from "./actions/write/evolve"

const wrapResult = result => ({ result: { ...result, success: true } })
export async function handle(state, action) {
  let _state = JSON.parse(JSON.stringify(state))
  switch (action.input.function) {
    case "nonce":
      return wrapResult(await nonce(_state, action))
    case "ids":
      return wrapResult(await ids(_state, action))
    case "get":
      return wrapResult(await get(_state, action))
    case "cget":
      return wrapResult(await get(_state, action, true))

    case "getSchema":
      return wrapResult(await getSchema(_state, action))
    case "getRules":
      return wrapResult(await getRules(_state, action))
    case "getIndexes":
      return wrapResult(await getIndexes(_state, action))

    case "add":
      await add(_state, action)
      break
    case "set":
      await set(_state, action)
      break
    case "update":
      await update(_state, action)
      break
    case "upsert":
      await upsert(_state, action)
      break
    case "delete":
      await remove(_state, action)
      break
    case "batch":
      await batch(_state, action)
      break
    case "addIndex":
      await addIndex(_state, action)
      break
    case "removeIndex":
      await removeIndex(_state, action)
      break
    case "setSchema":
      await setSchema(_state, action)
      break
    case "setRules":
      await setRules(_state, action)
      break
    case "evolve":
      await evolve(_state, action)
      break

    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return { state: _state, result: { success: true } }
}
