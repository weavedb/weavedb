import { err } from "./lib/utils"
import verifyPoseidon from "./actions/read/verifyPoseidon"
import { getLinkedContract } from "./actions/read/getLinkedContract"
import { linkContract } from "./actions/write/linkContract"
import { unlinkContract } from "./actions/write/unlinkContract"
export async function handle(state, action) {
  switch (action.input.function) {
    case "verify":
      return await verifyPoseidon(state, action)
    case "linkContract":
      return await linkContract(state, action)
    case "unlinkContract":
      return await unlinkContract(state, action)
    case "getLinkedContract":
      return await getLinkedContract(state, action)
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
