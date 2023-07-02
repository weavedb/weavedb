const { isNil } = require("ramda")

const { err } = require("../../../common/lib/utils")
const { getIndex } = require("../../lib/index")

const scanIndexes = ind => {
  let indexes = []
  for (let k in ind) {
    for (let k2 in ind[k]) {
      const _ind = [[k, k2]]
      if (!isNil(ind[k][k2]._)) indexes.push(_ind)
      if (!isNil(ind[k][k2].subs)) {
        const sub_indexes = scanIndexes(ind[k][k2].subs)
        for (let v of sub_indexes) {
          indexes.push([..._ind, ...v])
        }
      }
    }
  }
  return indexes
}

const getIndexes = async (state, action) => {
  const path = action.input.query
  if (path.length % 2 === 0) err()
  const index = getIndex(state, path)
  return {
    result: scanIndexes(index),
  }
}

module.exports = { getIndexes }
