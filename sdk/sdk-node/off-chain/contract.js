const { ids } = require("./actions/read/ids")
const { getSchema } = require("./actions/read/getSchema")
const { getRules } = require("./actions/read/getRules")
const { getIndexes } = require("./actions/read/getIndexes")
const { getCrons } = require("./actions/read/getCrons")
const { getAlgorithms } = require("./actions/read/getAlgorithms")
const { getLinkedContract } = require("./actions/read/getLinkedContract")
const { getOwner } = require("./actions/read/getOwner")
const { getAddressLink } = require("./actions/read/getAddressLink")
const { getRelayerJob } = require("./actions/read/getRelayerJob")
const { listRelayerJobs } = require("./actions/read/listRelayerJobs")
const { getEvolve } = require("./actions/read/getEvolve")
const { listCollections } = require("./actions/read/listCollections")
const { getInfo } = require("./actions/read/getInfo")

//const { cron } = require( "../common/lib/cron")
const { err, isEvolving } = require("./lib/utils")
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
    case "getAddressLink":
      return await getAddressLink(state, action)
    /*case "get":
      return await get(state, action)
    case "cget":
      return await get(state, action, true)*/
    case "listCollections":
      return await listCollections(state, action)
    case "getInfo":
      return await getInfo(state, action)
    case "getCrons":
      return await getCrons(state, action)
    case "getAlgorithms":
      return await getAlgorithms(state, action)
    case "getLinkedContract":
      return await getLinkedContract(state, action)
    case "listRelayerJobs":
      return await listRelayerJobs(state, action)
    case "getRelayerJob":
      return await getRelayerJob(state, action)
    case "getIndexes":
      return await getIndexes(state, action)
    case "getSchema":
      return await getSchema(state, action)
    case "getRules":
      return await getRules(state, action)
    case "ids":
      return await ids(state, action)
    case "getOwner":
      return await getOwner(state, action)
    case "getEvolve":
      return await getEvolve(state, action)

    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return { state }
}

module.exports = { handle }
