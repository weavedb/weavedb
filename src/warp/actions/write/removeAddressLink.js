import { is, isNil } from "ramda"
import { validate } from "../../../common/warp/lib/validate"
import { err } from "../../../common/warp/lib/utils"

export const removeAddressLink = async (state, action, signer) => {
  signer ||= await validate(state, action, "removeAddressLink")
  const { address } = action.input.query
  const link = state.auth.links[address.toLowerCase()]
  if (isNil(link)) err("link doesn't exist")
  let _address = is(Object, link) ? link.address : link
  if (signer !== address.toLowerCase() && signer !== _address) {
    err("signer is neither owner nor delegator")
  }
  delete state.auth.links[address.toLowerCase()]
  return { state }
}
