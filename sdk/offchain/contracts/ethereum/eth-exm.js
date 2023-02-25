import { wrapResult } from "../common/exm/lib/utils"
import { err, clone } from "../common/lib/utils"
import verify712 from "./actions/read/verify712"
import verify from "./actions/read/verify"
import { evolve } from "../common/warp/actions/write/evolve"
import { setCanEvolve } from "../common/actions/write/setCanEvolve"
import { getEvolve } from "../common/actions/read/getEvolve"

export async function handle(state, action) {
  let _state = clone(state)
  switch (action.input.function) {
    case "verify":
      return wrapResult(await verify(state, action))
    case "verify712":
      return wrapResult(await verify712(state, action))

    case "getEvolve":
      return wrapResult(await getEvolve(state, action))
    case "evolve":
      return await evolve(state, action)
    case "setCanEvolve":
      return await setCanEvolve(state, action)

    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return { state: _state, result: { success: true } }
}
