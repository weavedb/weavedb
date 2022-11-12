import { err } from "../../lib/utils"
import { is } from "ramda"
import { validate } from "../../lib/validate"

export const setCanEvolve = async (state, action, signer) => {
  signer ||= await validate(state, action, "setCanEvolve")
  if (state.owner !== signer) err("Only the owner can evolve a contract.")
  if (!is(Boolean)(action.input.query.value)) {
    err("Value must be a boolean.")
  }
  state.canEvolve = action.input.query.value
  return { state }
}
