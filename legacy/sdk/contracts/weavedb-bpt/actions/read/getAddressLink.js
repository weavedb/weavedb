const { is, isNil } = require("ramda")
const { kv } = require("../../lib/utils")

const getAddressLink = async (state, action, SmartWeave, kvs) => {
  const { address } = action.input.query
  const link = await kv(kvs, SmartWeave).get(`auth.${address.toLowerCase()}`)
  if (isNil(link)) return { result: null }
  let _address = is(Object, link) ? link.address : link
  let _expiry = is(Object, link) ? link.expiry || 0 : 0
  return {
    result: { address: _address, expiry: _expiry },
  }
}

module.exports = { getAddressLink }
