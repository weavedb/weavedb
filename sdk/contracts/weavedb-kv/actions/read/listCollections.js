const { keys, isNil, mergeLeft } = require("ramda")
const { kv, parse } = require("../../lib/utils")

const listCollections = async (state, action, SmartWeave, kvs) => {
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "listCollections",
    undefined,
    undefined,
    undefined,
    SmartWeave,
    kvs
  )
  return {
    result: keys(
      (await kv(kvs, SmartWeave).get(`data.${path.join("/")}`)) || {}
    ),
  }
}

module.exports = {
  listCollections,
}
