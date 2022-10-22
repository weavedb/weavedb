import { err } from "./lib/utils"
export async function handle(state, action) {
  switch (action.input.function) {
    case "get":
      return { result: state.poseidonConstants }
    case "evolve":
      if (state.canEvolve) {
        if (state.owner !== action.caller) {
          err("Only the owner can evolve a contract.")
        }
        state.evolve = action.input.value
        return { state }
      }
      break
    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return { state }
}
