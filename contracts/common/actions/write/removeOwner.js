import { err, isOwner } from "../../lib/utils"
import { isNil, without, includes, is, of } from "ramda"
import { validate } from "../../lib/validate"

export const removeOwner = async (state, action, signer) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "removeOwner"
    ))
  }
  const owner = isOwner(signer, state)

  if (!is(String)(action.input.query.address)) {
    err("Value must be string.")
  }

  if (!includes(action.input.query.address, owner)) {
    err("The owner doesn't exist.")
  }
  state.owner = without([action.input.query.address], owner)
  return { state, result: { original_signer } }
}
