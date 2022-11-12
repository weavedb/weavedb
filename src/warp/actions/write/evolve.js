import { mergeLeft } from "ramda"
import { err } from "../../lib/utils"
import { validate } from "../../lib/validate"

export const evolve = async (state, action, signer) => {
  signer ||= await validate(state, action, "evolve")
  if (state.owner !== signer) err("Only the owner can evolve a contract.")
  if (action.input.value !== action.input.query.value)
    err("Values don't match.")
  if (state.canEvolve) {
    state.evolve = action.input.value
  } else {
    err(`This contract cannot evolve.`)
  }
  return { state }
}
