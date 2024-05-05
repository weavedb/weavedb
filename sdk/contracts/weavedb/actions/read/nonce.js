const { isNil } = require("ramda")
const { err } = require("../../../common/lib/utils")

const nonce = async (state, action) => {
  const { nonces } = state
  let { address } = action.input
  if (isNil(address)) err(`No Address`)
  if (/^0x/.test(address)) address = address.toLowerCase()
  return { result: nonces[address] || 0 }
}

module.exports = { nonce }
