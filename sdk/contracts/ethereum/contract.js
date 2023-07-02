const { err } = require("../common/lib/utils")
const verify712 = require("./actions/read/verify712")
const verify = require("./actions/read/verify")
const { keys } = require("ramda")

async function handle(state, action, _SmartWeave) {
  if (typeof SmartWeave !== "undefined") _SmartWeave = SmartWeave
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

module.exports = { handle }
