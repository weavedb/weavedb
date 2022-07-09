import { isNil } from "ramda"
import { err } from "../../lib/utils"

export const nonce = async (state, action) => {
  const { nonces } = state
  const { address } = action.input
  if (isNil(address)) err(`No Address`)
  return { result: nonces[address.toLowerCase()] || 0 }
}
