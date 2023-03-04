const { is, isNil } = require("ramda")

const getAddressLink = async (state, action) => {
  const { address } = action.input.query
  const link = state.auth.links[address.toLowerCase()]
  if (isNil(link)) return { result: null }
  let _address = is(Object, link) ? link.address : link
  let _expiry = is(Object, link) ? link.expiry || 0 : 0
  return {
    result: { address: _address, expiry: _expiry },
  }
}

module.exports = { getAddressLink }
