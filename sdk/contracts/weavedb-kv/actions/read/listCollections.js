const { keys, isNil, mergeLeft } = require("ramda")
const { parse } = require("../../lib/utils")

const listCollections = async (state, action, SmartWeave) => {
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "listCollections",
    undefined,
    undefined,
    undefined,
    SmartWeave
  )
  return {
    result: keys((await SmartWeave.kv.get(`data.${path.join("/")}`)) || {}),
  }
}

module.exports = {
  listCollections,
}
