const { pickAll } = require("ramda")
const { isEvolving } = require("../../lib/utils")

const getEvolve = async (state, action) => {
  let evolve = pickAll(["canEvolve", "evolve"])(state)
  evolve.history = state.evolveHistory || []
  evolve.isEvolving = isEvolving(state)
  return { result: evolve }
}
module.exports = { getEvolve }
