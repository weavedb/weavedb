const err = (msg = `The wrong query`, contractErr = false) => {
  if (contractErr) {
    const error = typeof ContractError === "undefined" ? Error : ContractError
    throw new error(msg)
  } else {
    throw msg
  }
}

async function handle(state, action) {
  switch (action.input.function) {
    case "get":
      return { result: state.poseidonConstants }
    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`,
      )
  }
  return { state }
}

module.exports = { handle }
