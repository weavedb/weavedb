import { includes, map, toLower, init, last, isNil, head, nth } from "ramda"
import { err, validateSchema } from "../../lib/utils"
import { validate } from "../../lib/validate"

import { add } from "./add"
import { set } from "./set"
import { update } from "./update"
import { upsert } from "./upsert"
import { remove } from "./remove"
import { batch } from "./batch"

export const relay = async (state, action, signer, contractErr = true) => {
  signer ||= await validate(state, action, "relay")
  let jobID = head(action.input.query)
  let input = nth(1, action.input.query)
  let query = nth(2, action.input.query)
  let action2 = { input, relayer: signer, extra: query, jobID }
  const relayers = state.relayers || {}
  if (isNil(relayers[jobID])) err("relayer jobID doesn't exist")
  const allowed_relayers = map(toLower)(relayers[jobID].relayers || [])
  if (!includes(signer)(allowed_relayers)) {
    err(`relayer is not allowed for the job[${jobID}]`)
  }
  if (!isNil(relayers[jobID].schema)) {
    try {
      validateSchema(relayers[jobID].schema, query)
    } catch (e) {
      err("relayer data validation error")
    }
  }
  switch (action2.input.function) {
    case "add":
      return await add(state, action2)
    case "set":
      return await set(state, action2)
    case "update":
      return await update(state, action2)
    case "upsert":
      return await upsert(state, action2)
    case "delete":
      return await remove(state, action2)
    case "batch":
      return await batch(state, action2)
    default:
      err(
        `No function supplied or function not recognised: "${action2.input.function}"`
      )
  }

  return { state }
}
