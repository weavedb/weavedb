const { pick } = require("ramda")

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
  return {
    result: info,
  }
}
