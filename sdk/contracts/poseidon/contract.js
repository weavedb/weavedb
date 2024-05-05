const { err } = require("../common/lib/utils")
const { getEvolve } = require("../common/actions/read/getEvolve")

async function handle(state, action) {
  switch (action.input.function) {
    case "get":
      return { result: state.poseidonConstants }
    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return { state }
}

module.exports = { handle }
