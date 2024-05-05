const { err } = require("../../lib/utils")

const getTriggers = async (state, action, SmartWeave) => {
  const path = action.input.query
  if (path.length % 2 === 0) err()
  const trigger_key = `trigger.${path.join("/")}`
  return {
    result: state.triggers[trigger_key] ?? [],
  }
}

module.exports = { getTriggers }
