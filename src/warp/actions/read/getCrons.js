import { isNil } from "ramda"

export const getCrons = async (state, action) => {
  if (isNil(state.crons)) {
    state.crons = { lastExecuted: SmartWeave.block.timestamp, crons: {} }
  }
  return {
    result: state.crons,
  }
}
