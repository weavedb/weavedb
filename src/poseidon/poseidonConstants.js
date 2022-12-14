import { err } from "../common/lib/utils"
import { evolve } from "../common/warp/actions/write/evolve"
import { setCanEvolve } from "../common/actions/write/setCanEvolve"
import { getEvolve } from "../common/actions/read/getEvolve"

export async function handle(state, action) {
  switch (action.input.function) {
    case "get":
      return { result: state.poseidonConstants }
    case "getEvolve":
      return await getEvolve(state, action)
    case "evolve":
      return await evolve(state, action)
    case "setCanEvolve":
      return await setCanEvolve(state, action)
    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return { state }
}
