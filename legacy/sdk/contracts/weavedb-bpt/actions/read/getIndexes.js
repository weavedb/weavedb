const { keys, map, split, isNil, splitEvery } = require("ramda")
const { err } = require("../../lib/utils")
const { getIndexes: _getIndexes } = require("../../lib/index")

const getIndexes = async (state, action, SmartWeave, kvs) => {
  const path = action.input.query
  if (path.length % 2 === 0) err()
  const index = keys(await _getIndexes(path, kvs, SmartWeave))
  return {
    result: map(v => splitEvery(2, split("/")(v)))(index || []),
  }
}

module.exports = { getIndexes }
