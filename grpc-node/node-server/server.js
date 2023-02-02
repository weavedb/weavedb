const Cache = require("./cache")
const Snapshot = require("./snapshot")
const { saveSnapShotGCS, saveSnapShotS3 } = require("./snapshot")
const fs = require("fs")
const path = require("path")
const config = require("./weavedb.config.js")
const PROTO_PATH = __dirname + "/weavedb.proto"
let sdk = null
const {
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

let sdks = {}
let _init = {}

const allowed_contracts = map(v => v.split("@")[0])(
  isNil(config.contractTxId)
    ? []
    : is(Array, config.contractTxId)
    ? config.contractTxId
    : [config.contractTxId]
)

const allow_any_contracts =
  config.allowAnyContracts === true || allowed_contracts.length === 0

const isAllowed = contractTxId =>
  !allow_any_contracts && !includes(contractTxId)(allowed_contracts)

const isLmdb = (config.cache || "lmdb") === "lmdb"

const cache = new Cache(config)
const snapshot = new Snapshot(config)

async function query(call, callback) {
  const { method, query, nocache } = call.request
  let [func, contractTxId] = method.split("@")

  if (isNil(contractTxId)) {
    callback(null, {
      result: null,
      err: "contractTxId not specified",
    })
    return
  }

  contractTxId = contractTxId.split("@")[0]

  if (isAllowed(contractTxId)) {
    callback(null, {
      result: null,
      err: "contractTxId not allowed",
    })
    return
  }

  if (isNil(sdks[contractTxId])) {
    console.log("initializing contract..." + contractTxId)
    try {
      await initSDK(contractTxId)
      console.log(`sdk(${contractTxId}) ready!`)
    } catch (e) {
      console.log(`sdk(${contractTxId}) error!`)
      callback(null, {
        result: null,
        err: "sdk error",
      })
      return
    }
  }

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

  const cb = (result, err) =>
    callback(null, {
      result: JSON.stringify(result),
      err: err,
    })

  if (
    includes(func)(sdks[contractTxId].reads) &&
    (await cache.exists(key)) &&
    !nocache
  ) {
    result = (await cache.get(key)).result
    cb(result, err)
    await sendQuery()
  } else {
    ;({ result, err } = await sendQuery())
    cb(result, err)
  }
}

async function initSDK(v) {
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
    }
    await snapshot.recover(contractTxId)
  }
  sdks[contractTxId] = new SDK(_config)
  if (isNil(_config.wallet)) await sdks[contractTxId].initializeWithoutWallet()
  await sdks[contractTxId].db.readState()
  await snapshot.save(contractTxId)
  return
}

async function main() {
  const contracts = isNil(config.contractTxId)
    ? []
    : is(Array, config.contractTxId)
    ? config.contractTxId
    : [config.contractTxId]

  for (let v of contracts) {
    initSDK(v)
      .then(() => console.log(`sdk(${v}) ready!`))
      .catch(e => {
        console.log(`sdk(${v}) error!`)
        console.log(e)
      })
  }
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
