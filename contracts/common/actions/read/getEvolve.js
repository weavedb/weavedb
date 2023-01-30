import { pickAll } from "ramda"
import { isEvolving } from "../../lib/utils"

export const getEvolve = async (state, action) => {
  let evolve = pickAll(["canEvolve", "evolve"])(state)
  evolve.history = state.evolveHistory || []
  evolve.isEvolving = isEvolving(state)
  return {
    result: evolve,
  }
}
