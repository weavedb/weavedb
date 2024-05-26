const { keys, isNil, mergeLeft } = require("ramda")
const { err } = require("../../../common/lib/utils")
const getCollection = async (state, action, SmartWeave, kvs) => {
  if (isNil(action.input?.query?.[0])) err("collection ID not specified")
  return {
    result: state.collections?.[action.input.query[0]] ?? null,
  }
}

module.exports = { getCollection }
