const { isNil, mergeLeft } = require("ramda")
const { parse } = require("../../lib/utils")

const getSchema = async (state, action, SmartWeave) => {
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "getSchema",
    undefined,
    undefined,
    undefined,
    SmartWeave
  )

  return { result: _data.schema || null }
}

module.exports = { getSchema }
