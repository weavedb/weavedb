import { is, of, includes, mergeLeft } from "ramda"
import { err, isOwner } from "../../../lib/utils"
import { validate } from "../../../lib/validate"
import version from "../../../../warp/lib/version"

export const evolve = async (state, action, signer) => {
  signer ||= await validate(state, action, "evolve")
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
  })

  return { state }
}
