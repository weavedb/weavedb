const { keys } = require("ramda")
export const listRelayerJobs = async (state, action) => {
  return {
    result: keys(state.relayers || {}),
  }
}
