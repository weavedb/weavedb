const { isNil, is, of, includes, mergeLeft } = require("ramda")
const { err, isOwner } = require("../../lib/utils")
const { validate } = require("../../lib/validate")

const evolve = async (
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
      "evolve",
      SmartWeave
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
    data: SmartWeave.block.timestamp,
    srcTxId: action.input.value,
    oldVersion: state.version,
  })

  return { state, result: { original_signer } }
}

module.exports = { evolve }
