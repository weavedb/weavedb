const { keys, map, split, isNil, splitEvery } = require("ramda")
const { err } = require("../../../common/lib/utils")
const { getIndexes: _getIndexes } = require("../../lib/Collection")

const getIndexes = async (state, action, SmartWeave, kvs) => {
  const path = action.input.query
  if (path.length % 2 === 0) err()
  const index = keys(await _getIndexes(path, kvs, SmartWeave))
  return {
    result: map(v => splitEvery(2, split("/")(v)))(index || []),
  }
}

module.exports = { getIndexes }
