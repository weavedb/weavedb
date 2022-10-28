const { isNil, mergeLeft } = require("ramda")
const { err, parse, mergeData } = require("./utils")

exports.getRules = async (state, action) => {
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "getRules"
  )
  return { result: _data.rules || null }
}
