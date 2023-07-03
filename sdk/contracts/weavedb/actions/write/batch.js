const { includes, isNil, clone } = require("ramda")
const { parse } = require("../../lib/utils")
const { err, wrapResult } = require("../../../common/lib/utils")
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

const batch = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron
) => {
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
    const params = [
      _state,
      _action,
      signer,
      contractErr,
      SmartWeave,
      kvs,
      executeCron,
    ]
    switch (op) {
      case "add":
        res = await add(
          _state,
          _action,
          signer,
          i,
          contractErr,
          SmartWeave,
          kvs,
          executeCron
        )
        break
      case "set":
        res = await set(...params)
        break
      case "update":
        res = await update(...params)
        break
      case "upsert":
        res = await upsert(...params)
        break
      case "delete":
        res = await remove(...params)
        break
      case "setRules":
        res = await setRules(...params)
        break
      case "setSchema":
        res = await setSchema(...params)
        break

      case "setCanEvolve":
        res = await setCanEvolve(...params)
        break
      case "setSecure":
        res = await setSecure(...params)
        break
      case "setAlgorithms":
        res = await setAlgorithms(...params)
        break
      case "addIndex":
        res = await addIndex(...params)
        break
      case "addOwner":
        res = await addOwner(...params)
        break
      case "addRelayerJob":
        res = await addRelayerJob(...params)
        break
      case "addCron":
        const { addCron } = require("./addCron")
        res = await addCron(...params)
        break
      case "removeCron":
        res = await removeCron(...params)
        break
      case "removeIndex":
        res = await removeIndex(...params)
        break
      case "removeOwner":
        res = await removeOwner(...params)
        break
      case "removeRelayerJob":
        res = await removeRelayerJob(...params)
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
