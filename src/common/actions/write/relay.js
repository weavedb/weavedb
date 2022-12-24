import { init, last, isNil, head, tail } from "ramda"
import { err } from "../../lib/utils"
import { validate } from "../../lib/validate"

import { add } from "./add"
import { set } from "./set"
import { update } from "./update"
import { upsert } from "./upsert"
import { remove } from "./remove"
import { batch } from "./batch"

export const relay = async (state, action, signer, contractErr = true) => {
  signer ||= await validate(state, action, "relay")
  let input = head(action.input.query)
  let query = tail(action.input.query)
  switch (input.function) {
    case "add":
      return await add(state, { input })
    case "set":
      return await set(state, { input })
    case "update":
      return await update(state, { input })
    case "upsert":
      return await upsert(state, { input })
    case "delete":
      return await remove(state, { input })
    case "batch":
      return await batch(state, { input })
    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }

  return { state }
}
