const { kv } = require("../../lib/utils")
const validities = async (state, action, SmartWeave, kvs) => {
  const { tx } = action.input
  return {
    result: (await kv(kvs, SmartWeave).get(`tx_validities.${tx}`)) || null,
  }
}
module.exports = { validities }
