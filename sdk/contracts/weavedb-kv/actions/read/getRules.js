const { parse } = require("../../lib/utils")
const getRules = async (state, action, SmartWeave) => {
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "getRules",
    undefined,
    undefined,
    undefined,
    SmartWeave
  )

  return { result: _data.rules || null }
}

module.exports = { getRules }
