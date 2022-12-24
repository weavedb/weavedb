export const getRelayerJob = async (state, action) => {
  const jobs = state.relayers || {}
  return {
    result: jobs[action.input.query[0]] || null,
  }
}
