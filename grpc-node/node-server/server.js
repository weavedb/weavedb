const Arweave = require("arweave")
const Cache = require("./cache")
const Snapshot = require("./snapshot")
const { saveSnapShotGCS, saveSnapShotS3 } = require("./snapshot")
const fs = require("fs")
const path = require("path")
const config = require("./weavedb.config.js")
const PROTO_PATH = __dirname + "/weavedb.proto"
const { getSetups } = require("./admin")
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
const { validate } = require("./validate")
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const weavedb = grpc.loadPackageDefinition(packageDefinition).weavedb

let admin = null
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
  const error = err =>
    callback(null, {
      result: null,
      err,
    })

  if (func === "admin") {
    const _query = JSON.parse(query)
    const { op } = _query.query
    if (_query.type !== "rsa256") {
      error("Admin must be an Arweave account")
      return
    }
    if (contractTxId !== config.admin.contractTxId) {
      error(`The wrong admin contract (${contractTxId})`)
      return
    }
    const { err, signer } = await validate(_query, contractTxId)
    if (err) {
      error(`The wrong signature`)
      return
    } else if (signer !== admin && op !== "add_contract") {
      error(`The signer is not admin`)
      return
    }
    if (isNil(sdks[contractTxId])) {
      error(`Admin contract not ready`)
      return
    }
    let txs = []
    let isErr = null
    switch (op) {
      case "add_contract":
        const { contractTxId: txid } = _query.query
        try {
          const user = await sdks[contractTxId].get("users", signer)
          if (isNil(user) || !user.allow) {
            isErr = `${signer} is not allowed to add contract`
            callback(null, {
              result: JSON.stringify(txs),
              err: isErr,
            })
          } else {
            callback(null, {
              result: JSON.stringify(txs),
              err: isErr,
            })
            if (isNil(sdks[txid])) {
              console.log("initializing contract..." + txid)
              try {
                await initSDK(txid)
                console.log(`sdk(${txid}) ready!`)
              } catch (e) {
                console.log(`sdk(${txid}) error!`)
                error("sdk error")
              }
            }
          }
        } catch (e) {
          isErr = true
          console.log(e)
          callback(null, {
            result: JSON.stringify(txs),
            err: isErr,
          })
        }
        return
      case "whitelist":
        const { address, allow } = _query.query
        try {
          const tx1 = await sdks[contractTxId].upsert(
            { address, allow },
            "users",
            address,
            {
              ar: config.admin.owner,
            }
          )
          if (tx1.success) {
            txs.push(tx1)
          } else {
            throw new Error()
          }
        } catch (e) {
          isErr = true
        }
        callback(null, {
          result: JSON.stringify(txs),
          err: isErr,
        })
        return
      case "setup":
        try {
          const { schema, rules } = getSetups(admin)

          const tx1 = await sdks[contractTxId].setSchema(schema, "users", {
            ar: config.admin.owner,
          })
          if (tx1.success) {
            txs.push(tx1)
          } else {
            throw new Error()
          }
          const tx2 = await sdks[contractTxId].setRules(rules, "users", {
            ar: config.admin.owner,
          })

          if (tx2.success) {
            txs.push(tx2)
          } else {
            throw new Error()
          }
        } catch (e) {
          isErr = true
        }
        callback(null, {
          result: JSON.stringify(txs),
          err: isErr,
        })
        return
      default:
        error(`operation not found: ${op}`)
        return
    }
  }

  if (isNil(contractTxId)) {
    error("contractTxId not specified")
    return
  }

  contractTxId = contractTxId.split("@")[0]

  if (isAllowed(contractTxId)) {
    error("contractTxId not allowed")
    return
  }

  if (isNil(sdks[contractTxId])) {
    console.log("initializing contract..." + contractTxId)
    try {
      await initSDK(contractTxId)
      console.log(`sdk(${contractTxId}) ready!`)
    } catch (e) {
      console.log(`sdk(${contractTxId}) error!`)
      error("sdk error")
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
