import { err } from "./lib/utils"
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

export async function handle(state, action) {
  switch (action.input.function) {
    case "add":
      return (await add(state, action)).state
    case "set":
      return (await set(state, action)).state
    case "update":
      return (await update(state, action)).state
    case "upsert":
      return (await upsert(state, action)).state
    case "delete":
      return (await remove(state, action)).state
    case "batch":
      return (await batch(state, action)).state
    case "addIndex":
      return (await addIndex(state, action)).state
    case "removeIndex":
      return (await removeIndex(state, action)).state
    case "setSchema":
      return (await setSchema(state, action)).state
    case "setRules":
      return (await setRules(state, action)).state
    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return state
}
