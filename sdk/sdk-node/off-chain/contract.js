const { listCollections } = require("./actions/read/listCollections")

//import { cron } from "../common/lib/cron"
const { err, isEvolving } = require("./lib/utils")
//import version from "./lib/version"
const { includes } = require("ramda")

const writes = [
  "relay",
  "set",
  "setSchema",
  "setRules",
  "addIndex",
  "removeIndex",
  "add",
  "upsert",
  "remove",
  "batch",
  "addCron",
  "removeCron",
  "setAlgorithms",
  "addRelayerJob",
  "linkContract",
  "unlinkContract",
  "setCanEvolve",
  "setSecure",
  "addOwner",
  "removeOwner",
  "addAddressLink",
  "removeAddressLink",
]

async function handle(state, action) {
  if (isEvolving(state) && includes(action.input.function)(writes)) {
    err("contract needs migration")
  }

  try {
    //;({ state } = await cron(state))
  } catch (e) {
    console.log(e)
  }
  switch (action.input.function) {
    case "listCollections":
      return await listCollections(state, action)
    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return { state }
}

module.exports = { handle }
