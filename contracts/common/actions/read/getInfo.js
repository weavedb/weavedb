const { pick } = require("ramda")
const version = require("../../../warp/lib/version")

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
  return {
    result: info,
  }
}
