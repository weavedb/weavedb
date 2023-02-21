const { pick } = require("ramda")
const { isEvolving } = require("../../lib/utils")

const getInfo = async (state, action) => {
  let info = pick(
    [
      "auth",
      "canEvolve",
      "contracts",
      "evolve",
      "secure",
      "owner",
      "contracts",
    ],
    state
  )
  delete info.auth.links
  info.version = state.version || null
  info.evolveHistory = state.evolveHistory || []
  info.isEvolving = isEvolving(state)

  return { result: info }
}

module.exports = { getInfo }
