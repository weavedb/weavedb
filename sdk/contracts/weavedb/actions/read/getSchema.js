const { isNil, mergeLeft } = require("ramda")
const { parse } = require("../../lib/utils")

const getSchema = async (state, action) => {
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "getSchema"
  )
  return { result: _data.schema || null }
}

module.exports = { getSchema }
