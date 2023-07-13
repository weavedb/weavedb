const { isNil, is, of, includes, mergeLeft } = require("ramda")
const { err, isOwner, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")

const evolve = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "evolve",
      SmartWeave,
      true,
      kvs
    ))
  }
  const owner = isOwner(signer, state)

  if (action.input.value !== action.input.query.value) {
    err("Values don't match.")
  }

  if (state.canEvolve) {
    state.evolve = action.input.value
  } else {
    err(`This contract cannot evolve.`)
  }

  state.evolveHistory ||= []
  state.evolveHistory.push({
    signer,
    block: SmartWeave.block.height,
    date: SmartWeave.block.timestamp,
    srcTxId: action.input.value,
    oldVersion: state.version,
  })
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { evolve }
