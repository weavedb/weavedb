import { isNil, mergeLeft, init } from "ramda"
import { parse, mergeData } from "../../lib/utils"
import { err, isOwner } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { addIndex as _addIndex, getIndex } from "../../lib/index"

export const removeCron = async (state, action, signer) => {
  signer ||= await validate(state, action, "removeCron")
  const owner = isOwner(signer, state)
  if (isNil(state.crons)) {
    state.crons = { lastExecuted: SmartWeave.block.timestamp, crons: {} }
  }
  const [key] = action.input.query
  if (isNil(state.crons.crons[key])) err("cron doesn't exist")
  delete state.crons.crons[key]
  return { state }
}
