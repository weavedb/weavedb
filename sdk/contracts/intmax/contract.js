const { err } = require("../common/lib/utils")
const verifyPoseidon = require("./actions/read/verifyPoseidon")

const { evolve } = require("../weavedb/actions/write/evolve")
const { setCanEvolve } = require("../weavedb/actions/write/setCanEvolve")
const { getEvolve } = require("../common/actions/read/getEvolve")

async function handle(state, action) {
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

module.exports = { handle }
