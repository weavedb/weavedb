const { kv } = require("../../lib/utils")
const ids = async (state, action, SmartWeave, kvs) => {
  const { ids } = state
  const { tx } = action.input
  return {
    result: (await kv(kvs, SmartWeave).get(`tx_ids.${tx}`)) || null,
  }
}
module.exports = { ids }
