const hash = async (state, action) => {
  return { result: state.hash || null }
}

module.exports = { hash }
