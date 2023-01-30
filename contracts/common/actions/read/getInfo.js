const { pick } = require("ramda")
const version = require("../../../warp/lib/version")
import { isEvolving } from "../../lib/utils"

export const getInfo = async (state, action) => {
  let info = pick(
    [
      "auth",
      "canEvolve",
      "contracts",
      "evolve",
      "secure",
      "version",
      "owner",
      "contracts",
    ],
    state
  )
  delete info.auth.links
  info.version = version
  info.evolveHistory = state.evolveHistory || []
  info.isEvolving = isEvolving(state)
  return {
    result: info,
  }
}
