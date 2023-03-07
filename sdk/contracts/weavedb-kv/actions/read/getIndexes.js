const { map, split, isNil, splitEvery } = require("ramda")
const { err } = require("../../lib/utils")
const { getIndex } = require("../../lib/index")

const getIndexes = async (state, action, SmartWeave) => {
  const path = action.input.query
  if (path.length % 2 === 0) err()
  const index = await getIndex(path, SmartWeave)
  return {
    result: map(v => splitEvery(2, split("/")(v)))(index || []),
  }
}

module.exports = { getIndexes }
