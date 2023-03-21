const pako = require("pako")
const { validate } = require("../../lib/validate")
const { clone, wrapResult, err } = require("../../lib/utils")
const { isNil } = require("ramda")
const { set } = require("./set")
const { add } = require("./add")
const { update } = require("./update")
const { upsert } = require("./upsert")
const { remove } = require("./remove")
const { relay } = require("./relay")

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

const bundle = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "bundle",
      SmartWeave
    ))
  }

  const compressed = new Uint8Array(
    atob(action.input.query)
      .split("")
      .map(function (c) {
        return c.charCodeAt(0)
      })
  )
  const queries = JSON.parse(pako.inflate(compressed, { to: "string" }))
  let validity = []
  let errors = []
  let i = 0
  for (const q of queries) {
    let valid = true
    let error = null
    try {
      const op = q.function
      let res = null
      switch (op) {
        case "add":
          res = await add(
            clone(state),
            { input: q },
            undefined,
            i,
            false,
            SmartWeave
          )
          break
        case "set":
          res = await set(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "update":
          res = await update(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "upsert":
          res = await upsert(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "delete":
          res = await remove(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "setRules":
          res = await setRules(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "setSchema":
          res = await setSchema(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break

        case "setCanEvolve":
          res = await setCanEvolve(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "setSecure":
          res = await setSecure(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "setAlgorithms":
          res = await setAlgorithms(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "addIndex":
          res = await addIndex(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "addOwner":
          res = await addOwner(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "addRelayerJob":
          res = await addRelayerJob(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "addCron":
          const { addCron } = require("./addCron")
          res = await addCron(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "removeCron":
          res = await removeCron(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "removeIndex":
          res = await removeIndex(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "removeOwner":
          res = await removeOwner(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        case "removeRelayerJob":
          res = await removeRelayerJob(
            clone(state),
            { input: q },
            undefined,
            false,
            SmartWeave
          )
          break
        default:
          throw new Error(
            `No function supplied or function not recognised: "${q}"`
          )
      }
      if (!isNil(res)) state = res.state
    } catch (e) {
      error = e?.toString?.() || "unknown error"
      valid = false
    }
    validity.push(valid)
    errors.push(error)
    i++
  }
  return wrapResult(state, original_signer, SmartWeave, { validity, errors })
}

module.exports = { bundle }
