const { is, of } = require("ramda")

export const getOwner = async (state, action) => {
  let owner = state.owner || []
  if (is(String)(owner)) owner = of(owner)
  return {
    result: owner,
  }
}
