const { isNil, mergeLeft, init } = require("ramda")
const { parse, mergeData } = require("../../lib/utils")
const { err, isOwner } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { addIndex: _addIndex, getIndex } = require("../../lib/index")

const removeCron = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "removeCron",
      SmartWeave
    ))
  }
  const owner = isOwner(signer, state)
  if (isNil(state.crons)) {
    state.crons = { lastExecuted: SmartWeave.block.timestamp, crons: {} }
  }
  const [key] = action.input.query
  if (isNil(state.crons.crons[key])) err("cron doesn't exist")
  delete state.crons.crons[key]
  return {
    state,
    result: {
      original_signer,
      result: {
        original_signer,
        transaction: SmartWeave.transaction,
        block: SmartWeave.block,
      },
    },
  }
}

module.exports = { removeCron }
