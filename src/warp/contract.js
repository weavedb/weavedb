import { getDoc, parse, mergeData } from "./lib/utils"
import { err } from "../common/warp/lib/utils"
import { nonce } from "./actions/read/nonce"
import { ids } from "./actions/read/ids"
import { version } from "./actions/read/version"
import { get } from "./actions/read/get"
import { set } from "./actions/write/set"
import { setSchema } from "./actions/write/setSchema"
import { getSchema } from "./actions/read/getSchema"
import { setRules } from "./actions/write/setRules"
import { getRules } from "./actions/read/getRules"
import { addIndex } from "./actions/write/addIndex"
import { getIndexes } from "./actions/read/getIndexes"
import { removeIndex } from "./actions/write/removeIndex"
import { add } from "./actions/write/add"
import { update } from "./actions/write/update"
import { upsert } from "./actions/write/upsert"
import { remove } from "./actions/write/remove"
import { batch } from "./actions/write/batch"
import { cron } from "./lib/cron"
import { addCron } from "./actions/write/addCron"
import { removeCron } from "./actions/write/removeCron"
import { getCrons } from "./actions/read/getCrons"
import { getAlgorithms } from "./actions/read/getAlgorithms"
import { setAlgorithms } from "./actions/write/setAlgorithms"
import { getLinkedContract } from "./actions/read/getLinkedContract"
import { linkContract } from "./actions/write/linkContract"
import { unlinkContract } from "./actions/write/unlinkContract"

import { evolve } from "../common/warp/actions/write/evolve"
import { setCanEvolve } from "../common/warp/actions/write/setCanEvolve"
import { getEvolve } from "../common/warp/actions/read/getEvolve"

import { getOwner } from "../common/warp/actions/read/getOwner"
import { addOwner } from "../common/warp/actions/write/addOwner"
import { removeOwner } from "../common/warp/actions/write/removeOwner"

import { getAddressLink } from "./actions/read/getAddressLink"
import { addAddressLink } from "./actions/write/addAddressLink"
import { removeAddressLink } from "./actions/write/removeAddressLink"

export async function handle(state, action) {
  try {
    ;({ state } = await cron(state))
  } catch (e) {
    console.log(e)
  }

  switch (action.input.function) {
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
    default:
      err(
        `No function supplied or function not recognised: "${action.input.function}"`
      )
  }
  return { state }
}
