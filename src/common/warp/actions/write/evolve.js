import { is, of, includes, mergeLeft } from "ramda"
import { err } from "../../lib/utils"
import { validate } from "../../lib/validate"

export const evolve = async (state, action, signer) => {
  signer ||= await validate(state, action, "evolve")

  let owner = state.owner || []
  if (is(String)(owner)) owner = of(owner)
  if (!includes(signer)(owner)) err("Signer is not the owner.")

  if (action.input.value !== action.input.query.value) {
    err("Values don't match.")
  }

  if (state.canEvolve) {
    state.evolve = action.input.value
  } else {
    err(`This contract cannot evolve.`)
  }
  return { state }
}
