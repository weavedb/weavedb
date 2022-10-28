const { isNil } = require("ramda")
const { err } = require("./utils")

exports.ids = async (state, action) => {
  const { ids } = state
  const { tx } = action.input
  return { result: ids[tx] || null }
}
