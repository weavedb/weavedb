import { pickAll } from "ramda"

export const getEvolve = async (state, action) => {
  let evolve = pickAll(["canEvolve", "evolve"])(state)
  evolve.history = state.evolveHistory || []
  return {
    result: evolve,
  }
}
