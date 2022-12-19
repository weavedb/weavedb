import { err } from "../common/lib/utils"
import verify712 from "./actions/read/verify712"
import verify from "./actions/read/verify"
import { keys } from "ramda"
export async function handle(state, action) {
  switch (action.input.function) {
    case "verify":
      return await verify(state, action)
    case "verify712":
      return await verify712(state, action)
    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return { state }
}
