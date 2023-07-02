const pako = require("pako")
const { validate } = require("../../lib/validate")
const { err, wrapResult } = require("../../../common/lib/utils")
const { clone } = require("../../../common/lib/pure")
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
  SmartWeave,
  kvs
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "bundle",
      SmartWeave,
      true,
      kvs
    ))
  }
  const compressed = new Uint8Array(
    Buffer.from(action.input.query, "base64")
      .toString("binary")
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
    let params = [clone(state), { input: q }, undefined, false, SmartWeave, kvs]
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
