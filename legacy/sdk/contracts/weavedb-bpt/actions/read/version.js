const { isNil } = require("ramda")
const { err } = require("../../lib/utils")
const version = async (state, action) => {
  if (isNil(state.version)) err(`No version assigned`)
  return { result: state.version }
}

module.exports = { version }
