import { err, isOwner } from "../../lib/utils"
import { is } from "ramda"
import { validate } from "../../lib/validate"

export const setSecure = async (state, action, signer) => {
  signer ||= await validate(state, action, "setSecure")
  const owner = isOwner(signer, state)

  if (!is(Boolean)(action.input.query.value)) {
    err("Value must be a boolean.")
  }
  state.secure = action.input.query.value
  return { state }
}
