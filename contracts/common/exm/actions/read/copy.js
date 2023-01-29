import { err } from "../../../lib/utils"

export const copy = async (state, action) => {
  if (state.canEvolve !== true) err("contract cannot evolve")
  return {
    result: state,
  }
}
