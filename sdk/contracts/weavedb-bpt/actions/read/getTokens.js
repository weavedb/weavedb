const getTokens = async (state, action, SmartWeave, kvs) => {
  const tokens = state.tokens ?? { available: {}, locked: {} }
  const rollup = state.rollup ?? { height: 0, hash: SmartWeave.contract.id }
  const last_token_lock_date = state.last_token_lock_date ?? 0
  return { result: { tokens, rollup, last_token_lock_date } }
}

module.exports = { getTokens }
