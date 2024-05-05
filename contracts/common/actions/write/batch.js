import { includes, isNil, clone } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { set } from "./set"
import { add } from "./add"
import { update } from "./update"
import { upsert } from "./upsert"
import { remove } from "./remove"
import { relay } from "./relay"

import { setRules } from "./setRules"
import { setSchema } from "./setSchema"
import { setCanEvolve } from "./setCanEvolve"
import { setSecure } from "./setSecure"
import { setAlgorithms } from "./setAlgorithms"
import { addIndex } from "./addIndex"
import { addOwner } from "./addOwner"
import { addRelayerJob } from "./addRelayerJob"
import { addCron } from "./addCron"
import { removeCron } from "./removeCron"
import { removeIndex } from "./removeIndex"
import { removeOwner } from "./removeOwner"
import { removeRelayerJob } from "./removeRelayerJob"

export const batch = async (state, action, signer, contractErr = true) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(state, action, "batch"))
  }

  let _state = state
  let i = 0
  for (let v of action.input.query) {
    let [op, ...query] = v
    const _action = includes(op)(["addOwner", "removeOwner"])
      ? {
          input: { function: op, query: { address: query[0] } },
          caller: action.caller,
        }
      : includes(op)(["setCanEvolve", "setSecure"])
      ? {
          input: { function: op, query: { value: query[0] } },
          caller: action.caller,
        }
      : { input: { function: op, query }, caller: action.caller }

    let res = null
    switch (op) {
      case "add":
        res = await add(_state, _action, signer, i, contractErr)
        break
      case "set":
        res = await set(_state, _action, signer, contractErr)
        break
      case "update":
        res = await update(_state, _action, signer, contractErr)
        break
      case "upsert":
        res = await upsert(_state, _action, signer, contractErr)
        break
      case "delete":
        res = await remove(_state, _action, signer, contractErr)
        break
      case "setRules":
        res = await setRules(_state, _action, signer, contractErr)
        break
      case "setSchema":
        res = await setSchema(_state, _action, signer, contractErr)
        break

      case "setCanEvolve":
        res = await setCanEvolve(_state, _action, signer, contractErr)
        break
      case "setSecure":
        res = await setSecure(_state, _action, signer, contractErr)
        break
      case "setAlgorithms":
        res = await setAlgorithms(_state, _action, signer, contractErr)
        break
      case "addIndex":
        res = await addIndex(_state, _action, signer, contractErr)
        break
      case "addOwner":
        res = await addOwner(_state, _action, signer, contractErr)
        break
      case "addRelayerJob":
        res = await addRelayerJob(_state, _action, signer, contractErr)
        break
      case "addCron":
        res = await addCron(_state, _action, signer, contractErr)
        break
      case "removeCron":
        res = await removeCron(_state, _action, signer, contractErr)
        break
      case "removeIndex":
        res = await removeIndex(_state, _action, signer, contractErr)
        break
      case "removeOwner":
        res = await removeOwner(_state, _action, signer, contractErr)
        break
      case "removeRelayerJob":
        res = await removeRelayerJob(_state, _action, signer, contractErr)
        break

      default:
        const msg = `No function supplied or function not recognised: "${op}"`
        if (contractErr) {
          err(msg)
        } else {
          throw msg
        }
    }
    _state = res.state
    i++
  }
  return { state: _state, result: { original_signer } }
}
