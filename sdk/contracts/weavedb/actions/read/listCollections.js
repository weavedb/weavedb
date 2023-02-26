const { keys, isNil, mergeLeft } = require("ramda")
const { parse } = require("../../lib/utils")

const listCollections = async (state, action) => {
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "listCollections"
  )
  return {
    result: keys(path.length === 0 ? data : _data.subs),
  }
}

module.exports = {
  listCollections,
}
