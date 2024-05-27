const err = (msg = `The wrong query`, contractErr = false) => {
  if (contractErr) {
    const error = typeof ContractError === "undefined" ? Error : ContractError
    throw new error(msg)
  } else {
    throw msg
  }
}

const verifyInternetIdentity = require("./actions/read/verifyInternetIdentity")

async function handle(state, action, _SmartWeave) {
  if (typeof SmartWeave !== "undefined") _SmartWeave = SmartWeave
  switch (action.input.function) {
    case "verify":
      return await verifyInternetIdentity(state, action)
    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`,
      )
  }
  return { state }
}

module.exports = { handle }
