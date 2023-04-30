const { ids } = require("./actions/read/ids")
const { nonce } = require("./actions/read/nonce")
const { version } = require("./actions/read/version")
const { hash } = require("./actions/read/hash")
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
const { getTriggers } = require("./actions/read/getTriggers")

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
const { bundle } = require("./actions/write/bundle")
const { relay } = require("./actions/write/relay")
const { migrate } = require("./actions/write/migrate")
const { addTrigger } = require("./actions/write/addTrigger")
const { removeTrigger } = require("./actions/write/removeTrigger")

const { cron, executeCron } = require("./lib/cron")
const { err, isEvolving } = require("./lib/utils")
const { includes, isNil, keys, filter, compose, match } = require("ramda")

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
  "bundle",
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
  let kvs = {}
  if (typeof SmartWeave !== "undefined") _SmartWeave = SmartWeave
  if (
    isEvolving(state) &&
    includes(action.input.function)(writes) &&
    action.input.function !== "evolve"
  ) {
    err("contract needs migration")
  }
  try {
    let _kvs = {}
    ;({ state } = await cron(state, _SmartWeave, _kvs))
    kvs = _kvs
  } catch (e) {
    console.log(e)
  }
  const addHash = async ({ state, result }) => {
    if (isNil(state.hash)) {
      state.hash = _SmartWeave.transaction.id
    } else {
      const hashes = _SmartWeave.arweave.utils.concatBuffers([
        _SmartWeave.arweave.utils.stringToBuffer(state.hash),
        _SmartWeave.arweave.utils.stringToBuffer(_SmartWeave.transaction.id),
      ])
      const hash = await _SmartWeave.arweave.crypto.hash(hashes, "SHA-384")
      state.hash = _SmartWeave.arweave.utils.bufferTob64(hash)
    }
    return { state, result }
  }

  const readParams = [state, action, _SmartWeave, kvs]
  const writeParams = [state, action, undefined, undefined, _SmartWeave, kvs]
  let res = null
  switch (action.input.function) {
    case "get":
      return await get(state, action, false, _SmartWeave, kvs)
    case "cget":
      return await get(state, action, true, _SmartWeave, kvs)
    case "getAddressLink":
      return await getAddressLink(...readParams)
    case "listCollections":
      return await listCollections(...readParams)
    case "getInfo":
      return await getInfo(...readParams)
    case "getCrons":
      return await getCrons(...readParams)
    case "getAlgorithms":
      return await getAlgorithms(...readParams)
    case "getLinkedContract":
      return await getLinkedContract(...readParams)
    case "listRelayerJobs":
      return await listRelayerJobs(...readParams)
    case "getRelayerJob":
      return await getRelayerJob(...readParams)
    case "getIndexes":
      return await getIndexes(...readParams)
    case "getTriggers":
      return await getTriggers(...readParams)
    case "getSchema":
      return await getSchema(...readParams)
    case "getRules":
      return await getRules(...readParams)
    case "ids":
      return await ids(...readParams)
    case "nonce":
      return await nonce(...readParams)
    case "hash":
      return await hash(...readParams)
    case "version":
      return await version(...readParams)
    case "getOwner":
      return await getOwner(...readParams)
    case "getEvolve":
      return await getEvolve(...readParams)
    case "add":
      res = await addHash(
        await add(
          state,
          action,
          undefined,
          undefined,
          undefined,
          _SmartWeave,
          kvs,
          executeCron
        )
      )
      break
    case "set":
      res = await addHash(await set(...writeParams, executeCron))
      break
    case "upsert":
      res = await addHash(await upsert(...writeParams, executeCron))
      break
    case "update":
      res = await addHash(await update(...writeParams, executeCron))
      break
    case "delete":
      res = await addHash(await remove(...writeParams, executeCron))
      break
    case "batch":
      res = await addHash(await batch(...writeParams, executeCron))
      break
    case "bundle":
      res = await addHash(await bundle(...writeParams))
      break
    case "relay":
      res = await addHash(await relay(...writeParams))
      break
    case "addOwner":
      res = await addHash(await addOwner(...writeParams))
      break
    case "removeOwner":
      res = await addHash(await removeOwner(...writeParams))
      break
    case "setAlgorithms":
      res = await addHash(await setAlgorithms(...writeParams))
      break
    case "setCanEvolve":
      res = await addHash(await setCanEvolve(...writeParams))
      break
    case "setSecure":
      res = await addHash(await setSecure(...writeParams))
      break
    case "setSchema":
      res = await addHash(await setSchema(...writeParams))
      break
    case "addIndex":
      res = await addHash(await addIndex(...writeParams))
      break
    case "removeIndex":
      res = await addHash(await removeIndex(...writeParams))
      break
    case "setRules":
      res = await addHash(await setRules(...writeParams))
      break
    case "removeCron":
      res = await addHash(await removeCron(...writeParams))
      break
    case "addRelayerJob":
      res = await addHash(await addRelayerJob(...writeParams))
      break
    case "removeRelayerJob":
      res = await addHash(await removeRelayerJob(...writeParams))
      break
    case "linkContract":
      res = await addHash(await linkContract(...writeParams))
      break
    case "unlinkContract":
      res = await addHash(await unlinkContract(...writeParams))
      break
    case "removeAddressLink":
      res = await addHash(await removeAddressLink(...writeParams))
      break
    case "addCron":
      res = await addHash(await addCron(...writeParams))
      break
    case "addTrigger":
      res = await addHash(await addTrigger(...writeParams))
      break
    case "removeTrigger":
      res = await addHash(await removeTrigger(...writeParams))
      break

    case "addAddressLink":
      res = await addHash(
        await addAddressLink(
          state,
          action,
          undefined,
          undefined,
          _SmartWeave,
          undefined,
          kvs
        )
      )
      break
    case "evolve":
      res = await addHash(await evolve(...writeParams))
      break
    case "migrate":
      res = await addHash(await migrate(...writeParams))
      break
    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  if (!isNil(res)) {
    for (let k in kvs) await _SmartWeave.kv.put(k, kvs[k])
    console.log(
      compose(
        filter(v => v.match(/^index\..+/) !== null),
        keys
      )(kvs)
    )
    console.log(kvs)
    return res
  }
  return { state }
}

module.exports = { handle }
