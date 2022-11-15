import { err, clone, wrapResult } from "../common/exm/lib/utils"
import { mergeLeft } from "ramda"

import { nonce } from "../common/actions/read/nonce"
import { ids } from "../common/actions/read/ids"
import { get } from "../common/actions/read/get"
import { getSchema } from "../common/actions/read/getSchema"
import { getRules } from "../common/actions/read/getRules"
import { getIndexes } from "../common/actions/read/getIndexes"

import { add } from "../common/actions/write/add"
import { set } from "../common/actions/write/set"
import { update } from "../common/actions/write/update"
import { upsert } from "../common/actions/write/upsert"
import { remove } from "../common/actions/write/remove"
import { batch } from "../common/actions/write/batch"
import { addIndex } from "../common/actions/write/addIndex"
import { removeIndex } from "../common/actions/write/removeIndex"
import { setSchema } from "../common/actions/write/setSchema"
import { setRules } from "../common/actions/write/setRules"
import { evolve } from "../common/exm/actions/write/evolve"

export async function handle(state, action) {
  let _state = clone(state)
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
