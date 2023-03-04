const { parse } = require("../../lib/utils")
const getRules = async (state, action) => {
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "getRules"
  )
  return { result: _data.rules || null }
}

module.exports = { getRules }
