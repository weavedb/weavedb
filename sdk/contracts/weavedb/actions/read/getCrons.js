const { isNil } = require("ramda")

const getCrons = async (state, action) => {
  if (isNil(state.crons)) {
    state.crons = { lastExecuted: Math.round(Date.now() / 1000), crons: {} }
  }
  return {
    result: state.crons,
  }
}

module.exports = { getCrons }
