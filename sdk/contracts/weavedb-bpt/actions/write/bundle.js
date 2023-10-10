const { err, wrapResult, read } = require("../../../common/lib/utils")
const { kv } = require("../../lib/utils")
const { clone } = require("../../../common/lib/pure")
const { isNil, includes, map, addIndex: _addIndex } = require("ramda")
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

const getId = async (input, timestamp, SmartWeave) => {
  const str = JSON.stringify({
    contractTxId: SmartWeave.contract.id,
    input,
    timestamp,
  })
  return SmartWeave.arweave.utils.bufferTob64Url(
    await SmartWeave.arweave.crypto.hash(
      SmartWeave.arweave.utils.stringToBuffer(str)
    )
  )
}

const getHash = async (ids, SmartWeave) => {
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
  if (isBundler) {
    let { hash: last_hash, height: h } = state.rollup ?? {
      height: 0,
      hash: SmartWeave.contract.id,
    }
    let ids = []
    for (let [i, v] of parsed.q.entries()) {
      ids.push(await getId(v, parsed.t[i], SmartWeave))
    }
    const current_hash = await getHash(ids, SmartWeave)
    if (h + 1 !== parsed.n) {
      if (h + 1 < parsed.n) {
        let cached =
          (await kv(kvs, SmartWeave).get(`bundles.${parsed.n}`)) ?? []
        let validity = []
        for (let [i, v] of parsed.q.entries()) {
          validity.push([ids[i], parsed.n, 2])
        }
        parsed.i = ids
        parsed.ch = current_hash
        cached.unshift({ ...parsed })
        await kv(kvs, SmartWeave).put(`bundles.${parsed.n}`, cached)
        await kv(kvs, SmartWeave).put(
          `tx_validities.${SmartWeave.transaction.id}`,
          validity
        )
        return wrapResult(state, original_signer, SmartWeave, {
          validity,
          errors: [],
        })
      } else {
        err(`the wrong bundle height [${h} => ${parsed.n}]`)
      }
    }
    const new_hash = await getNewHash(last_hash, current_hash, SmartWeave)
    if (parsed.h !== new_hash) {
      err(`the wrong hash [${parsed.h}, ${new_hash}]`)
    }
    last_hash = new_hash
    state.rollup = { height: parsed.n, hash: new_hash }
    queries = _addIndex(map)((v, i) => ({
      q: v,
      t: parsed.t[i],
      n: parsed.n,
      i: ids[i],
    }))(parsed.q)
    if (isNil(parsed.t) || parsed.q.length !== parsed.t.length) {
      err(`timestamp length is not equal to query length`)
    }
    let last = state.last_block ?? 0
    for (let [i, v] of parsed.t.entries()) {
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

      await kv(kvs, SmartWeave).put(`bundles.${height}`, null)
      let next = false
      for (let [i, v] of _cached.entries()) {
        const new_hash = await getNewHash(last_hash, v.ch, SmartWeave)
        if (v.h !== new_hash) continue
        for (let [i2, v2] of v.q.entries()) {
          queries.push({ q: v2, t: v.t[i2], n: height, i: v.i[i2] })
        }
        next = true
        state.rollup = { height, hash: new_hash }
        last_hash = new_hash
        break
      }
      if (!next) break
      height++
    }
  } else {
    queries = map(v => ({ q: v }))(parsed)
  }
  let validity = []
  let errors = []
  for (const v of queries) {
    let valid = true
    let error = null
    let params = [
      clone(state),
      { input: v.q, timestamp: isBundler ? v.t : null },
      undefined,
      false,
      SmartWeave,
      kvs,
      executeCron,
      undefined,
      "bundle",
    ]
    try {
      const op = v.q.function
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
            { input: v.q, timestamp: isBundler ? v.t : null },
            undefined,
            undefined,
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
            `No function supplied or function not recognised: "${op}"`
          )
      }
      if (!isNil(res)) state = res.state
    } catch (e) {
      error = e?.toString?.() || "unknown error"
      valid = false
    }
    validity.push(isBundler ? [v.i, v.n, valid ? 0 : 1] : valid)
    errors.push(error)
  }
  await kv(kvs, SmartWeave).put(
    `tx_validities.${SmartWeave.transaction.id}`,
    validity
  )
  return wrapResult(state, original_signer, SmartWeave, { validity, errors })
}

module.exports = { bundle }
