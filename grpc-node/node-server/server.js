const Arweave = require("arweave")
const Cache = require("./cache")
const Snapshot = require("./snapshot")
const { saveSnapShotGCS, saveSnapShotS3 } = require("./snapshot")
const fs = require("fs")
const path = require("path")
const config = require("./weavedb.config.js")
const PROTO_PATH = __dirname + "/weavedb.proto"
const { execAdmin } = require("./admin")
const {
  pluck,
  is,
  isNil,
  includes,
  clone,
  map,
  splitWhen,
  complement,
  init,
} = require("ramda")

const SDK = require("weavedb-sdk-node")
const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")
const { getKey } = require("./utils")
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const weavedb = grpc.loadPackageDefinition(packageDefinition).weavedb

let admin = null
let admin_sdk = null
let sdks = {}
let _init = {}
let lastChecked = {}
const allowed_contracts = map(v => v.split("@")[0])(
  isNil(config.contractTxId)
    ? []
    : is(Array, config.contractTxId)
    ? config.contractTxId
    : [config.contractTxId]
)

const allow_any_contracts = config.allowAnyContracts === true

const isAllowed = contractTxId =>
  !isNil(sdks[contractTxId]) ||
  allow_any_contracts ||
  includes(contractTxId)(allowed_contracts) ||
  (!isNil(config.admin) && config.admin.contractTxId === contractTxId)

const isLmdb = (config.cache || "lmdb") === "lmdb"

const cache = new Cache(config)
const snapshot = new Snapshot(config)

async function query(call, callback) {
  const { method, query, nocache } = call.request
  let [func, contractTxId] = method.split("@")
  const res = (err, result = null) =>
    callback(null, {
      result: isNil(result) ? null : JSON.stringify(result),
      err,
    })

  if (isNil(contractTxId) && func !== "admin") {
    return res("contractTxId not specified")
  }

  if (!isNil(contractTxId)) contractTxId = contractTxId.split("@")[0]

  if (
    !isNil(config.redis) &&
    !isNil(config.ratelimit) &&
    !isNil(config.ratelimit.every)
  ) {
    const RateLimitCounter = require("./rate_limit_counter.js")
    const ratelimit = new RateLimitCounter(config.ratelimit, config.redis)
    await ratelimit.init()
    try {
      if (await ratelimit.checkCountLimit(contractTxId)) {
        return res("ratelimit error ")
      }
    } catch (e) {
      console.log(e.message)
    }
  }

  if (func === "admin") {
    return await execAdmin({
      query,
      res,
      sdks,
      admin,
      initSDK,
      contractTxId,
      snapshot,
    })
  }
  if (!isAllowed(contractTxId)) {
    let allowed = false
    if (!isNil(admin_sdk)) {
      try {
        const date = Date.now()
        if (
          isNil(lastChecked[contractTxId]) ||
          lastChecked[contractTxId] < date - 1000 * 60 * 10
        ) {
          lastChecked[contractTxId] = date
          if (!isNil(await admin_sdk.get("contracts", contractTxId))) {
            allowed = true
          }
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!allowed) return res(`contractTxId[${contractTxId}] not allowed`)
  }

  if (isNil(sdks[contractTxId]) && !(await initSDK(contractTxId))) return

  const key = getKey(contractTxId, func, query)
  let result = null
  let err = null

  const sendQuery = async () => {
    const nameMap = { get: "getCache", cget: "cgetCache" }
    try {
      if (includes(func)(["get", "cget", "getNonce"])) {
        if (
          includes(func)(["get", "cget"]) &&
          (isNil(_init[contractTxId]) || nocache)
        ) {
          result = await sdks[contractTxId][func](...JSON.parse(query))
          _init[contractTxId] = true
        } else {
          result = await sdks[contractTxId][nameMap[func] || func](
            ...JSON.parse(query)
          )
        }
      } else if (includes(func)(sdks[contractTxId].reads)) {
        result = await sdks[contractTxId][func](...JSON.parse(query))
        await cache.set(key, { date: Date.now(), result })
      } else {
        result = await sdks[contractTxId].write(
          func,
          JSON.parse(query),
          true,
          true
        )
      }
    } catch (e) {
      err = e.message
    }
    return { result, err }
  }

  if (
    includes(func)(sdks[contractTxId].reads) &&
    (await cache.exists(key)) &&
    !nocache
  ) {
    result = (await cache.get(key)).result
    res(err, result)
    await sendQuery()
  } else {
    ;({ result, err } = await sendQuery())
    res(err, result)
  }
}

async function initSDK(v, no_snapshot = false) {
  console.log("initializing contract..." + v)
  let success = true
  try {
    let _config = clone(config)
    let [contractTxId, old] = v.split("@")
    _config.contractTxId = contractTxId
    if (old === "old") _config.old = true
    if (isLmdb) {
      _config.lmdb = {
        state: { dbLocation: `./cache/warp/${_config.contractTxId}/state` },
        contracts: {
          dbLocation: `./cache/warp/${_config.contractTxId}/contracts`,
        },
        src: {
          dbLocation: `./cache/warp/${_config.contractTxId}/src`,
        },
      }
      if (!no_snapshot) await snapshot.recover(contractTxId)
    }
    sdks[contractTxId] = new SDK(_config)
    if (isNil(_config.wallet))
      await sdks[contractTxId].initializeWithoutWallet()
    await sdks[contractTxId].db.readState()
    if (isLmdb && !no_snapshot) await snapshot.save(contractTxId)
    console.log(`sdk(${v}) ready!`)

    if (!isNil(config.admin)) {
      if (
        !no_snapshot &&
        !isNil(config.admin.contractTxId) &&
        config.admin.contractTxId === v
      ) {
        try {
          const contracts = await sdks[contractTxId].get("contracts")
          admin_sdk = sdks[contractTxId]
          for (const v2 of pluck("txid", contracts)) {
            if (v2 !== config.admin.contractTxId) initSDK(v2)
          }
        } catch (e) {}
      }
    }
  } catch (e) {
    console.log(`sdk(${v}) error!`)
    success = false
  }
  return success
}

async function main() {
  let contracts = isNil(config.contractTxId)
    ? []
    : is(Array, config.contractTxId)
    ? config.contractTxId
    : [config.contractTxId]

  if (!isNil(config.admin)) {
    if (!isNil(config.admin.contractTxId)) {
      console.log(`Admin Contract: ${config.admin.contractTxId}`)
      contracts.push(config.admin.contractTxId)
    }
    if (!isNil(config.admin.owner)) {
      try {
        admin = await Arweave.init().wallets.jwkToAddress(config.admin.owner)
        console.log(`Admin Account: ${admin}`)
      } catch (e) {
        console.log(e)
      }
    }
  }
  for (let v of contracts) initSDK(v)

  cache.init()

  const server = new grpc.Server()

  server.addService(weavedb.DB.service, {
    query,
  })

  server.bindAsync(
    "0.0.0.0:9090",
    grpc.ServerCredentials.createInsecure(),
    () => {
      server.start()
    }
  )
  console.log("server ready!")
}

main()
