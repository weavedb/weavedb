const { isNil } = require("ramda")
const { kv } = require("../../lib/utils")
const { err } = require("../../../common/lib/utils")

const nonce = async (state, action, SmartWeave, kvs) => {
  let { address } = action.input
  if (isNil(address)) err(`No Address`)
  if (/^0x/.test(address)) address = address.toLowerCase()
  return { result: (await kv(kvs, SmartWeave).get(`nonce.${address}`)) || 0 }
}

module.exports = { nonce }
