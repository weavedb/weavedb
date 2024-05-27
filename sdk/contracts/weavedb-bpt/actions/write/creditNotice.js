const { err, wrapResult } = require("../../lib/utils")
const { includes, is, of, append, isNil } = require("ramda")

const creditNotice = async (
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
  let token = action.caller
  state.tokens ??= { available: {}, locked: {} }
  state.tokens.available[token] ??= "0"
  if (
    isNil(action.input.Quantity) ||
    Number.isNaN(action.input.Quantity) ||
    !/^[0-9]+$/.test(action.input.Quantity)
  ) {
    err(`Quantity is not a valid number: ${action.input.Quantity}`)
  }
  state.tokens.available[token] = (
    BigInt(state.tokens.available[token]) + BigInt(action.input.Quantity ?? "0")
  ).toString()
  return wrapResult(state, token, SmartWeave)
}
module.exports = { creditNotice }
