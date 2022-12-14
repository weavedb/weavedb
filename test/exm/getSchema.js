const { isNil, mergeLeft } = require("ramda")
const { err, parse, mergeData } = require("./utils")

exports.getSchema = async (state, action) => {
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "getSchema"
  )
  return { result: _data.schema || null }
}
