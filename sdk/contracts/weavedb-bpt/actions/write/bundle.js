const { err, wrapResult, read } = require("../../../common/lib/utils")
const { kv } = require("../../lib/utils")
const { clone } = require("../../../common/lib/pure")
const { isNil, includes } = require("ramda")
const { set } = require("./set")
const { add } = require("./add")
const { update } = require("./update")
const { upsert } = require("./upsert")
const { remove } = require("./remove")
const { relay } = require("./relay")
const { batch } = require("./batch")
const { query } = require("./query")

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
const { addTrigger } = require("./addTrigger")
const { removeTrigger } = require("./removeTrigger")
const { setBundlers } = require("./setBundlers")

const bundle = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron
) => {
  const bundlers = state.bundlers ?? []
  let isBundler = bundlers.length !== 0
  if (isBundler && !includes(action.caller, bundlers)) {
    err(`bundler [${action.caller}] is not allowed`)
  }
  const original_signer = action.caller
  const { data } = await read(
    state.contracts.bundler,
    {
      function: "inflate",
      data: action.input.query,
    },
    SmartWeave
  )
  const parsed = JSON.parse(data)
  let queries = null
  let ts = null
  if (isBundler) {
    let h = (await kv(kvs, SmartWeave).get(`bundle_height`)) ?? 0
    if (h + 1 !== parsed.h) err(`the wrong bundle height [${h} => ${parsed.h}]`)
    await kv(kvs, SmartWeave).put(`bundle_height`, parsed.h)
    queries = parsed.q
    ts = parsed.t
    if (isNil(ts) || queries.length !== ts.length) {
      err(`timestamp length is not equal to query length`)
    }
    let last = (state.last_block ?? 0) * 1000
    for (let [i, v] of ts.entries()) {
      if (last > v) {
        err(`the wrong timestamp[${i}]: ${last} <= ${v}`)
      }
      last = v
    }
    state.last_block = last
  } else {
    queries = parsed
  }
  let validity = []
  let errors = []
  let i = 0
  for (const q of queries) {
    let valid = true
    let error = null
    let params = [
      clone(state),
      { input: q, timestamp: isBundler ? ts[i] : null },
      undefined,
      false,
      SmartWeave,
      kvs,
      executeCron,
      undefined,
      "bundle",
    ]
    try {
      const op = q.function
      let res = null
      switch (op) {
        case "relay":
          res = await relay(...params)
          break
        case "batch":
          res = await batch(...params)
          break
        case "add":
          res = await add(
            clone(state),
            { input: q, timestamp: isBundler ? ts[i] : null },
            undefined,
            i,
            false,
            SmartWeave,
            kvs,
            executeCron,
            undefined,
            "bundle"
          )
          break
        case "query":
          res = await query(...params)
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
        case "addTrigger":
          res = await addTrigger(...params)
          break
        case "removeTrigger":
          res = await removeTrigger(...params)
          break

        case "setBundlers":
          res = await setBundlers(...params)
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
  await kv(kvs, SmartWeave).put(
    `tx_validities.${SmartWeave.transaction.id}`,
    validity
  )
  return wrapResult(state, original_signer, SmartWeave, { validity, errors })
}

module.exports = { bundle }
