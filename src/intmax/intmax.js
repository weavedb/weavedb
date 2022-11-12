import { err } from "../common/warp/lib/utils"
import verifyPoseidon from "./actions/read/verifyPoseidon"

import { evolve } from "../common/warp/actions/write/evolve"
import { setCanEvolve } from "../common/warp/actions/write/setCanEvolve"
import { getEvolve } from "../common/warp/actions/read/getEvolve"

export async function handle(state, action) {
  switch (action.input.function) {
    case "verify":
      return await verifyPoseidon(state, action)
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
