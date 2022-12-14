import { err } from "../../lib/utils"
import { is, of, includes } from "ramda"
import { validate } from "../../lib/validate"

export const setCanEvolve = async (state, action, signer) => {
  signer ||= await validate(state, action, "setCanEvolve")
  let owner = state.owner || []
  if (is(String)(owner)) owner = of(owner)
  if (!includes(signer)(owner)) err("Signer is not the owner.")
  if (!is(Boolean)(action.input.query.value)) {
    err("Value must be a boolean.")
  }
  state.canEvolve = action.input.query.value
  return { state }
}
