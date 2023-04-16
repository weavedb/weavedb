const { parse } = require("../../lib/utils")
const getRules = async (state, action, SmartWeave, kvs) => {
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "getRules",
    undefined,
    undefined,
    undefined,
    SmartWeave,
    kvs
  )

  return { result: _data.rules || null }
}

module.exports = { getRules }
