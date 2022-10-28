const { err } = require("./utils")
const { nonce } = require("./nonce")
const { ids } = require("./ids")
const { get } = require("./get")
const { getSchema } = require("./getSchema")
const { getRules } = require("./getRules")
const { getIndexes } = require("./getIndexes")

async function handle(state, action) {
  switch (action.input.function) {
    case "get":
      return (await get(state, action)).result
    case "cget":
      return (await get(state, action, true)).result
    case "getIndexes":
      return (await getIndexes(state, action)).result
    case "getSchema":
      return (await getSchema(state, action)).result
    case "getRules":
      return (await getRules(state, action)).result
    case "nonce":
      return (await nonce(state, action)).result
    case "ids":
      return (await ids(state, action)).result
    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return null
}

exports.handle = handle
