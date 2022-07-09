import { err, getDoc, parse, mergeData } from "./lib/utils"
import { nonce } from "./actions/read/nonce"
import { ids } from "./actions/read/ids"
import { get } from "./actions/read/get"
import { set } from "./actions/write/set"
import { add } from "./actions/write/add"
import { update } from "./actions/write/update"
import { upsert } from "./actions/write/upsert"
import { remove } from "./actions/write/remove"

export async function handle(state, action) {
  const input = action.input
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
    case "nonce":
      return await nonce(state, action)
    case "ids":
      return await ids(state, action)
    case "delete":
      return await remove(state, action)
    default:
      err(
        `No function supplied or function not recognised: "${input.function}"`
      )
  }
  return { state }
}
