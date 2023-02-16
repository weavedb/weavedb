const { is, of } = require("ramda")

const getOwner = async (state, action) => {
  let owner = state.owner || []
  if (is(String)(owner)) owner = of(owner)
  return { result: owner }
}

module.exports = { getOwner }
