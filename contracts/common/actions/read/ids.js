import { isNil } from "ramda"
import { err } from "../../lib/utils"

export const ids = async (state, action) => {
  const { ids } = state
  const { tx } = action.input
  return { result: ids[tx] || null }
}
