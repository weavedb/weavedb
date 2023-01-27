import { err, isOwner } from "../../lib/utils"
import { includes, is, of, append } from "ramda"
import { validate } from "../../lib/validate"

export const addOwner = async (state, action, signer) => {
  signer ||= await validate(state, action, "addOwner")
  const owner = isOwner(signer, state)
  if (!is(String)(action.input.query.address)) {
    err("Value must be string.")
  }

  if (!is(String)(action.input.query.address)) {
    err("Value must be string.")
  }
  if (includes(action.input.query.address, owner)) {
    err("The owner already exists.")
  }
  state.owner = append(action.input.query.address, owner)
  return { state }
}
