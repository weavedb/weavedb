const { ids } = require("./actions/read/ids")
const { nonce } = require("./actions/read/nonce")
const { version } = require("./actions/read/version")
const { get } = require("./actions/read/get")
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

const { set } = require("./actions/write/set")
const { upsert } = require("./actions/write/upsert")
const { update } = require("./actions/write/update")
const { remove } = require("./actions/write/remove")
const { addOwner } = require("./actions/write/addOwner")
const { removeOwner } = require("./actions/write/removeOwner")
const { setAlgorithms } = require("./actions/write/setAlgorithms")
const { setCanEvolve } = require("./actions/write/setCanEvolve")
const { setSecure } = require("./actions/write/setSecure")
const { setSchema } = require("./actions/write/setSchema")
const { addIndex } = require("./actions/write/addIndex")
const { removeIndex } = require("./actions/write/removeIndex")
const { setRules } = require("./actions/write/setRules")
const { removeCron } = require("./actions/write/removeCron")
const { addRelayerJob } = require("./actions/write/addRelayerJob")
const { removeRelayerJob } = require("./actions/write/removeRelayerJob")
const { linkContract } = require("./actions/write/linkContract")
const { unlinkContract } = require("./actions/write/unlinkContract")
const { removeAddressLink } = require("./actions/write/removeAddressLink")
const { addCron } = require("./actions/write/addCron")
const { addAddressLink } = require("./actions/write/addAddressLink")
const { evolve } = require("./actions/write/evolve")
const { add } = require("./actions/write/add")
const { batch } = require("./actions/write/batch")
const { relay } = require("./actions/write/relay")
const { migrate } = require("./actions/write/migrate")

const { cron } = require("./lib/cron")
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

async function handle(state, action, _SmartWeave) {
  if (typeof SmartWeave !== "undefined") _SmartWeave = SmartWeave
  if (isEvolving(state) && includes(action.input.function)(writes)) {
    err("contract needs migration")
  }
  try {
    ;({ state } = await cron(state, _SmartWeave))
  } catch (e) {
    console.log(e)
  }
  switch (action.input.function) {
    case "get":
      return await get(state, action, false, _SmartWeave)
    case "cget":
      return await get(state, action, true, _SmartWeave)
    case "getAddressLink":
      return await getAddressLink(state, action)
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
    case "nonce":
      return await nonce(state, action)
    case "version":
      return await version(state, action)
    case "getOwner":
      return await getOwner(state, action)
    case "getEvolve":
      return await getEvolve(state, action)
    case "add":
      return await add(
        state,
        action,
        undefined,
        undefined,
        undefined,
        _SmartWeave
      )
    case "set":
      return await set(state, action, undefined, undefined, _SmartWeave)
    case "upsert":
      return await upsert(state, action, undefined, undefined, _SmartWeave)
    case "update":
      return await update(state, action, undefined, undefined, _SmartWeave)
    case "delete":
      return await remove(state, action, undefined, undefined, _SmartWeave)
    case "batch":
      return await batch(state, action, undefined, undefined, _SmartWeave)

    case "relay":
      return await relay(state, action, undefined, undefined, _SmartWeave)

    case "addOwner":
      return await addOwner(state, action, undefined, undefined, _SmartWeave)
    case "removeOwner":
      return await removeOwner(state, action, undefined, undefined, _SmartWeave)
    case "setAlgorithms":
      return await setAlgorithms(
        state,
        action,
        undefined,
        undefined,
        _SmartWeave
      )
    case "setCanEvolve":
      return await setCanEvolve(
        state,
        action,
        undefined,
        undefined,
        _SmartWeave
      )
    case "setSecure":
      return await setSecure(state, action, undefined, undefined, _SmartWeave)
    case "setSchema":
      return await setSchema(state, action, undefined, undefined, _SmartWeave)
    case "addIndex":
      return await addIndex(state, action, undefined, undefined, _SmartWeave)
    case "removeIndex":
      return await removeIndex(state, action, undefined, undefined, _SmartWeave)

    case "setRules":
      return await setRules(state, action, undefined, undefined, _SmartWeave)
    case "removeCron":
      return await removeCron(state, action, undefined, undefined, _SmartWeave)
    case "addRelayerJob":
      return await addRelayerJob(
        state,
        action,
        undefined,
        undefined,
        _SmartWeave
      )
    case "removeRelayerJob":
      return await removeRelayerJob(
        state,
        action,
        undefined,
        undefined,
        _SmartWeave
      )
    case "linkContract":
      return await linkContract(
        state,
        action,
        undefined,
        undefined,
        _SmartWeave
      )
    case "unlinkContract":
      return await unlinkContract(
        state,
        action,
        undefined,
        undefined,
        _SmartWeave
      )
    case "removeAddressLink":
      return await removeAddressLink(
        state,
        action,
        undefined,
        undefined,
        _SmartWeave
      )

    case "addCron":
      return await addCron(state, action, undefined, undefined, _SmartWeave)
    case "addAddressLink":
      return await addAddressLink(
        state,
        action,
        undefined,
        undefined,
        _SmartWeave
      )
    case "evolve":
      return await evolve(state, action, undefined, undefined, _SmartWeave)
    case "migrate":
      return await migrate(state, action, undefined, undefined, _SmartWeave)

    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return { state }
}

module.exports = { handle }
