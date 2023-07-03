const { err } = require("../common/lib/utils")
const { evolve } = require("../weavedb/actions/write/evolve")
const { setCanEvolve } = require("../weavedb/actions/write/setCanEvolve")
const { getEvolve } = requre("../weavedb/actions/read/getEvolve")

async function handle(state, action) {
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

module.exports = { handle }
