const ids = async (state, action) => {
  const { ids } = state
  const { tx } = action.input
  return { result: ids[tx] || null }
}
module.exports = { ids }
