import { isNil } from "ramda"
import { err } from "../../lib/utils"

export const version = async (state, action) => {
  if (isNil(state.version)) err(`No version assigned`)
  return { result: state.version }
}
