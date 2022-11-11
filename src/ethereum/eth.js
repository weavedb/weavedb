import { err } from "../lib/utils"
import verify712 from "./actions/read/verify712"
import verify from "./actions/read/verify"
export async function handle(state, action) {
  switch (action.input.function) {
    case "verify":
      return await verify(state, action)
    case "verify712":
      return await verify712(state, action)
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
