const { err, wrapResult } = require("../../../common/lib/utils")
const { includes, is, of, append, isNil } = require("ramda")

const lockTokens = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth = 1,
  type = "direct",
) => {
  state.tokens ??= { available: {}, available_l2: {}, locked: {} }
  state.tokens.available_l2 ??= {}
  const height = action.extra.height
  const last_token_lock_date = state.last_token_lock_date ?? 0
  if (height <= state.last_token_lock_height) err("tokens already locked")
  if (last_token_lock_date !== action.extra.last_token_lock_date) {
    err("last_token_lock_date doesn't match")
  }
  const tokens = action.extra.tokens
  for (const k in tokens) {
    state.tokens.available[k] ??= "0"
    state.tokens.available_l2[k] ??= "0"
    state.tokens.locked[k] ??= "0"
    if (type === "bundle") {
      state.tokens.available[k] = (
        BigInt(state.tokens.available[k]) - BigInt(tokens[k] ?? "0")
      ).toString()
      state.tokens.locked[k] = (
        BigInt(state.tokens.locked[k]) + BigInt(tokens[k] ?? "0")
      ).toString()
    }
    state.tokens.available_l2[k] = (
      BigInt(state.tokens.available_l2[k]) + BigInt(tokens[k] ?? "0")
    ).toString()
  }
  state.last_tokens_lock_height = action.extra.height
  return wrapResult(state, signer, SmartWeave)
}

module.exports = { lockTokens }
