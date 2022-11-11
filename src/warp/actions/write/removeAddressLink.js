import { isNil } from "ramda"
import { err } from "../../lib/utils"
import { validate } from "../../lib/validate"
const { recoverTypedSignature } = require("../../lib/eth-sig-util")

export const removeAddressLink = async (state, action, signer) => {
  signer ||= await validate(state, action, "removeAddressLink")
  const { address } = action.input.query
  if (isNil(state.auth.links[address.toLowerCase()])) err("link doesn't exist")
  if (
    signer !== address.toLowerCase() &&
    signer !== state.auth.links[address.toLowerCase()]
  ) {
    err("signer is neither owner nor delegator")
  }
  delete state.auth.links[address.toLowerCase()]
  return { state }
}
