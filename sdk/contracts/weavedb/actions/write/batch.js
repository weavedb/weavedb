const { includes, isNil, clone } = require("ramda")
const { wrapResult, err, parse, mergeData } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { set } = require("./set")
const { add } = require("./add")
const { update } = require("./update")
const { upsert } = require("./upsert")
const { remove } = require("./remove")
//const { relay } = require("./relay")

const { setRules } = require("./setRules")
const { setSchema } = require("./setSchema")
const { setCanEvolve } = require("./setCanEvolve")
const { setSecure } = require("./setSecure")
const { setAlgorithms } = require("./setAlgorithms")
const { addIndex } = require("./addIndex")
const { addOwner } = require("./addOwner")
const { addRelayerJob } = require("./addRelayerJob")
const { removeCron } = require("./removeCron")
const { removeIndex } = require("./removeIndex")
const { removeOwner } = require("./removeOwner")
const { removeRelayerJob } = require("./removeRelayerJob")

const batch = async (state, action, signer, contractErr = true, SmartWeave) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "batch",
      SmartWeave
    ))
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
        res = await add(_state, _action, signer, i, contractErr, SmartWeave)
        break
      case "set":
        res = await set(_state, _action, signer, contractErr, SmartWeave)
        break
      case "update":
        res = await update(_state, _action, signer, contractErr, SmartWeave)
        break
      case "upsert":
        res = await upsert(_state, _action, signer, contractErr, SmartWeave)
        break
      case "delete":
        res = await remove(_state, _action, signer, contractErr, SmartWeave)
        break
      case "setRules":
        res = await setRules(_state, _action, signer, contractErr, SmartWeave)
        break
      case "setSchema":
        res = await setSchema(_state, _action, signer, contractErr, SmartWeave)
        break

      case "setCanEvolve":
        res = await setCanEvolve(
          _state,
          _action,
          signer,
          contractErr,
          SmartWeave
        )
        break
      case "setSecure":
        res = await setSecure(_state, _action, signer, contractErr, SmartWeave)
        break
      case "setAlgorithms":
        res = await setAlgorithms(
          _state,
          _action,
          signer,
          contractErr,
          SmartWeave
        )
        break
      case "addIndex":
        res = await addIndex(_state, _action, signer, contractErr, SmartWeave)
        break
      case "addOwner":
        res = await addOwner(_state, _action, signer, contractErr, SmartWeave)
        break
      case "addRelayerJob":
        res = await addRelayerJob(
          _state,
          _action,
          signer,
          contractErr,
          SmartWeave
        )
        break
      case "addCron":
        const { addCron } = require("./addCron")
        res = await addCron(_state, _action, signer, contractErr, SmartWeave)
        break
      case "removeCron":
        res = await removeCron(_state, _action, signer, contractErr, SmartWeave)
        break
      case "removeIndex":
        res = await removeIndex(
          _state,
          _action,
          signer,
          contractErr,
          SmartWeave
        )
        break
      case "removeOwner":
        res = await removeOwner(
          _state,
          _action,
          signer,
          contractErr,
          SmartWeave
        )
        break
      case "removeRelayerJob":
        res = await removeRelayerJob(
          _state,
          _action,
          signer,
          contractErr,
          SmartWeave
        )
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
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { batch }
