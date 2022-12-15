const { isNil } = require("ramda")

const getIndex = (state, path) => {
  if (isNil(state.indexes[path.join(".")])) state.indexes[path.join(".")] = {}
  return state.indexes[path.join(".")]
}
module.exports = { getIndex }
