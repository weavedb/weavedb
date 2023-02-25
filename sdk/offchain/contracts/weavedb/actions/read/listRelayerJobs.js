const { keys } = require("ramda")
const listRelayerJobs = async (state, action) => {
  return {
    result: keys(state.relayers || {}),
  }
}

module.exports = { listRelayerJobs }
