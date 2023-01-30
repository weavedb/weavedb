import { err } from "../common/lib/utils"

import { nonce } from "../common/actions/read/nonce"
import { ids } from "../common/actions/read/ids"
import { get } from "../common/actions/read/get"
import { getSchema } from "../common/actions/read/getSchema"
import { getRules } from "../common/actions/read/getRules"
import { getIndexes } from "../common/actions/read/getIndexes"
import { getCrons } from "../common/actions/read/getCrons"
import { getAlgorithms } from "../common/actions/read/getAlgorithms"
import { getLinkedContract } from "../common/actions/read/getLinkedContract"
import { getOwner } from "../common/actions/read/getOwner"
import { getAddressLink } from "../common/actions/read/getAddressLink"
import { getRelayerJob } from "../common/actions/read/getRelayerJob"
import { listRelayerJobs } from "../common/actions/read/listRelayerJobs"
import { getEvolve } from "../common/actions/read/getEvolve"
import { version } from "../common/actions/read/version"
import { listCollections } from "../common/actions/read/listCollections"
import { getInfo } from "../common/actions/read/getInfo"

import { relay } from "../common/actions/write/relay"
import { set } from "../common/actions/write/set"
import { setSchema } from "../common/actions/write/setSchema"
import { setRules } from "../common/actions/write/setRules"
import { addIndex } from "../common/actions/write/addIndex"
import { removeIndex } from "../common/actions/write/removeIndex"
import { add } from "../common/actions/write/add"
import { update } from "../common/actions/write/update"
import { upsert } from "../common/actions/write/upsert"
import { remove } from "../common/actions/write/remove"
import { batch } from "../common/actions/write/batch"
import { cron } from "../common/lib/cron"
import { addCron } from "../common/actions/write/addCron"
import { removeCron } from "../common/actions/write/removeCron"
import { setAlgorithms } from "../common/actions/write/setAlgorithms"
import { addRelayerJob } from "../common/actions/write/addRelayerJob"
import { removeRelayerJob } from "../common/actions/write/removeRelayerJob"
import { linkContract } from "../common/actions/write/linkContract"
import { unlinkContract } from "../common/actions/write/unlinkContract"
import { evolve } from "../common/warp/actions/write/evolve"
import { setCanEvolve } from "../common/actions/write/setCanEvolve"
import { setSecure } from "../common/actions/write/setSecure"
import { addOwner } from "../common/actions/write/addOwner"
import { removeOwner } from "../common/actions/write/removeOwner"
import { addAddressLink } from "../common/actions/write/addAddressLink"
import { removeAddressLink } from "../common/actions/write/removeAddressLink"

export async function handle(state, action) {
  try {
    ;({ state } = await cron(state))
  } catch (e) {
    console.log(e)
  }
  switch (action.input.function) {
    case "relay":
      return await relay(state, action)
    case "getAddressLink":
      return await getAddressLink(state, action)
    case "addAddressLink":
      return await addAddressLink(state, action)
    case "removeAddressLink":
      return await removeAddressLink(state, action)
    case "add":
      return await add(state, action)
    case "set":
      return await set(state, action)
    case "update":
      return await update(state, action)
    case "upsert":
      return await upsert(state, action)
    case "get":
      return await get(state, action)
    case "cget":
      return await get(state, action, true)
    case "listCollections":
      return await listCollections(state, action)
    case "getInfo":
      return await getInfo(state, action)
    case "addCron":
      return await addCron(state, action)
    case "removeCron":
      return await removeCron(state, action)
    case "getCrons":
      return await getCrons(state, action)
    case "getAlgorithms":
      return await getAlgorithms(state, action)
    case "getLinkedContract":
      return await getLinkedContract(state, action)
    case "setAlgorithms":
      return await setAlgorithms(state, action)
    case "listRelayerJobs":
      return await listRelayerJobs(state, action)
    case "getRelayerJob":
      return await getRelayerJob(state, action)
    case "addRelayerJob":
      return await addRelayerJob(state, action)
    case "removeRelayerJob":
      return await removeRelayerJob(state, action)
    case "linkContract":
      return await linkContract(state, action)
    case "unlinkContract":
      return await unlinkContract(state, action)
    case "addIndex":
      return await addIndex(state, action)
    case "getIndexes":
      return await getIndexes(state, action)
    case "removeIndex":
      return await removeIndex(state, action)
    case "setSchema":
      return await setSchema(state, action)
    case "getSchema":
      return await getSchema(state, action)
    case "setRules":
      return await setRules(state, action)
    case "getRules":
      return await getRules(state, action)
    case "nonce":
      return await nonce(state, action)
    case "version":
      return await version(state, action)
    case "ids":
      return await ids(state, action)
    case "delete":
      return await remove(state, action)
    case "batch":
      return await batch(state, action)
    case "getOwner":
      return await getOwner(state, action)
    case "addOwner":
      return await addOwner(state, action)
    case "removeOwner":
      return await removeOwner(state, action)
    case "getEvolve":
      return await getEvolve(state, action)
    case "evolve":
      return await evolve(state, action)
    case "setCanEvolve":
      return await setCanEvolve(state, action)
    case "setSecure":
      return await setSecure(state, action)

    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return { state }
}
