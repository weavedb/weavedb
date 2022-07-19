import { err, getDoc, parse, mergeData } from "./lib/utils"
import { nonce } from "./actions/read/nonce"
import { ids } from "./actions/read/ids"
import { get } from "./actions/read/get"
import { set } from "./actions/write/set"
import { setSchema } from "./actions/write/setSchema"
import { getSchema } from "./actions/read/getSchema"
import { setRules } from "./actions/write/setRules"
import { getRules } from "./actions/read/getRules"
import { addIndex } from "./actions/write/addIndex"
import { getIndexes } from "./actions/read/getIndexes"
import { removeIndex } from "./actions/write/removeIndex"
import { add } from "./actions/write/add"
import { update } from "./actions/write/update"
import { upsert } from "./actions/write/upsert"
import { remove } from "./actions/write/remove"
import { batch } from "./actions/write/batch"

export async function handle(state, action) {
  switch (action.input.function) {
    case "add":
      return await add(state, action)
    case "set":
      return await set(state, action)
    case "update":
      return await update(state, action)
    case "upsert":
      return await upsert(state, action)
    case "get":
      return await get(state, action)
    case "cget":
      return await get(state, action, true)
    case "addIndex":
      return await addIndex(state, action)
    case "getIndexes":
      return await getIndexes(state, action)
    case "removeIndex":
      return await removeIndex(state, action)
    case "setSchema":
      return await setSchema(state, action)
    case "getSchema":
      return await getSchema(state, action)
    case "setRules":
      return await setRules(state, action)
    case "getRules":
      return await getRules(state, action)
    case "nonce":
      return await nonce(state, action)
    case "ids":
      return await ids(state, action)
    case "delete":
      return await remove(state, action)
    case "batch":
      return await batch(state, action)
    case "evolve":
      if (state.canEvolve) {
        if (state.owner !== action.caller) {
          throw new ContractError("Only the owner can evolve a contract.")
        }
        state.evolve = action.input.value
        return { state }
      }
      break
    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return { state }
}
