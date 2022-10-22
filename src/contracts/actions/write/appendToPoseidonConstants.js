import { isNil, is, concat } from "ramda"
import { err, parse } from "../../lib/utils"

export const appendToPoseidonConstants = async (state, action, signer) => {
  if (action.caller !== state.owner) {
    err("caller is not contract owner", contractErr)
  }
  const { key, arrays } = action.input
  if (isNil(arrays) || isNil(key)) {
    throw new ContractError(`Key or Arrays not specified`)
  }
  if (isNil(state.poseidonConstants[key])) state.poseidonConstants[key] = []
  state.poseidonConstants[key] = concat(state.poseidonConstants[key], arrays)
  return { state }
}
