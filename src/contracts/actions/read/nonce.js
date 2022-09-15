import { isNil } from "ramda"
import { err } from "../../lib/utils"

export const nonce = async (state, action) => {
  const { nonces } = state
  let { address } = action.input
  if (isNil(address)) err(`No Address`)
  if (/^0x/.test(address)) address = address.toLowerCase()
  return { result: nonces[address] || 0 }
}
