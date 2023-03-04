const { isNil } = require("ramda")
const { err } = require("../../lib/utils")

const nonce = async (state, action, SmartWeave) => {
  const { nonces } = state
  let { address } = action.input
  if (isNil(address)) err(`No Address`)
  if (/^0x/.test(address)) address = address.toLowerCase()
  return { result: (await SmartWeave.kv.get(`nonce.${address}`)) || 0 }
}

module.exports = { nonce }
