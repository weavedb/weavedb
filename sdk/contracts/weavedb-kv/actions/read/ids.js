const ids = async (state, action, SmartWeave) => {
  const { ids } = state
  const { tx } = action.input
  return {
    result: (await SmartWeave.kv.get(`tx_ids.${tx}`)) || null,
  }
}
module.exports = { ids }
