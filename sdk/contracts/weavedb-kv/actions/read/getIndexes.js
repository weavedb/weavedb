const { map, split, isNil, splitEvery } = require("ramda")
const { err } = require("../../../common/lib/utils")
const { getIndex } = require("../../lib/index")

const getIndexes = async (state, action, SmartWeave, kvs) => {
  const path = action.input.query
  if (path.length % 2 === 0) err()
  const index = await getIndex(path, SmartWeave, kvs)
  return {
    result: map(v => splitEvery(2, split("/")(v)))(index || []),
  }
}

module.exports = { getIndexes }
