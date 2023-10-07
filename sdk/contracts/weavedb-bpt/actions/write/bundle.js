const { err, wrapResult, read } = require("../../../common/lib/utils")
const { kv } = require("../../lib/utils")
const { clone } = require("../../../common/lib/pure")
const { isNil, includes, map } = require("ramda")
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

const getHash = async (p, SmartWeave) => {
  let ids = []
  for (let [i, v] of p.q.entries()) {
    const str = JSON.stringify({
      contractTxId: SmartWeave.contract.id,
      input: v,
      timestamp: p.t[i],
    })
    ids.push(
      SmartWeave.arweave.utils.bufferTob64Url(
        await SmartWeave.arweave.crypto.hash(
          SmartWeave.arweave.utils.stringToBuffer(str)
        )
      )
    )
  }
  return SmartWeave.arweave.utils.bufferTob64(
    await SmartWeave.arweave.crypto.hash(
      SmartWeave.arweave.utils.concatBuffers(
        map(v2 => SmartWeave.arweave.utils.stringToBuffer(v2))(ids)
      ),
      "SHA-384"
    )
  )
}
const getNewHash = async (last_hash, current_hash, SmartWeave) => {
  const hashes = SmartWeave.arweave.utils.concatBuffers([
    SmartWeave.arweave.utils.stringToBuffer(last_hash),
    SmartWeave.arweave.utils.stringToBuffer(current_hash),
  ])
  return SmartWeave.arweave.utils.bufferTob64(
    await SmartWeave.arweave.crypto.hash(hashes, "SHA-384")
  )
}
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
    let last_hash =
      (await kv(kvs, SmartWeave).get(`last_hash`)) ?? SmartWeave.contract.id
    let h = (await kv(kvs, SmartWeave).get(`bundle_height`)) ?? 0
    if (h + 1 !== parsed.n) {
      if (h + 1 < parsed.n) {
        let cached =
          (await kv(kvs, SmartWeave).get(`bundles.${parsed.n}`)) ?? []
        cached.unshift({ ...parsed })
        await kv(kvs, SmartWeave).put(`bundles.${parsed.n}`, cached)
        return wrapResult(state, original_signer, SmartWeave)
      } else {
        err(`the wrong bundle height [${h} => ${parsed.n}]`)
      }
    }
    const current_hash = await getHash(parsed, SmartWeave)
    const new_hash = await getNewHash(last_hash, current_hash, SmartWeave)
    if (parsed.h !== new_hash) err(`the wrong hash`)
    await kv(kvs, SmartWeave).put(`last_hash`, new_hash)
    last_hash = new_hash
    await kv(kvs, SmartWeave).put(`bundle_height`, parsed.n)
    queries = parsed.q
    ts = parsed.t
    if (isNil(ts) || queries.length !== ts.length) {
      err(`timestamp length is not equal to query length`)
    }
    let last = state.last_block ?? 0
    for (let [i, v] of ts.entries()) {
      if (last > v) {
        err(`the wrong timestamp[${i}]: ${last} <= ${v}`)
      }
      last = v
    }
    state.last_block = last
    let height = parsed.n + 1
    while (true) {
      let _cached = (await kv(kvs, SmartWeave).get(`bundles.${height}`)) ?? []
      if (_cached.length === 0) break
      await kv(kvs, SmartWeave).put(`bundles.${parsed.n}`, null)
      let next = false
      for (let [i, v] of _cached.entries()) {
        const current_hash = await getHash(v, SmartWeave)
        const new_hash = await getNewHash(last_hash, current_hash, SmartWeave)
        if (v.h !== new_hash) continue
        for (let [i2, v2] of v.q.entries()) {
          ts.push(v.q[i2])
          queries.push(v2)
        }
        next = true
        await kv(kvs, SmartWeave).put(`last_hash`, new_hash)
        last_hash = new_hash
        break
      }
      if (!next) break
      height++
    }
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
