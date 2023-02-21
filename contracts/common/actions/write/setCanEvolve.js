import { err, isOwner } from "../../lib/utils"
import { isNil, is } from "ramda"
import { validate } from "../../lib/validate"

export const setCanEvolve = async (state, action, signer) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "setCanEvolve"
    ))
  }

  const owner = isOwner(signer, state)
  if (!is(Boolean)(action.input.query.value)) {
    err("Value must be a boolean.")
  }
  state.canEvolve = action.input.query.value
  return { state, result: { original_signer } }
}
