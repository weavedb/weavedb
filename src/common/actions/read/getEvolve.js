import { pickAll } from "ramda"

export const getEvolve = async (state, action) => {
  return {
    result: pickAll(["canEvolve", "evolve"])(state),
  }
}
