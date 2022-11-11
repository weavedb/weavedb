import { isNil } from "ramda"

export const getLinkedContract = async (state, action) => {
  const contracts = state.contracts || {}
  return {
    result: contracts[action.input.query[0]] || null,
  }
}
