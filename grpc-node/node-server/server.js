const md5 = require("md5")
const config = require("./weavedb.config.js")
const PROTO_PATH = __dirname + "/weavedb.proto"
let sdk = null
const { is, isNil, includes, clone, map } = require("ramda")
const SDK = require("weavedb-sdk-node")
const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const weavedb = grpc.loadPackageDefinition(packageDefinition).weavedb
let sdks = {}
let _cache = {}
const reads = [
  "get",
  "cget",
  "getIndexes",
  "getCrons",
  "getSchema",
  "getRules",
  "getIds",
  "getOwner",
  "getAddressLink",
  "getAlgorithms",
  "getLinkedContract",
  "getEvolve",
  "getVersion",
  "getRelayerJob",
  "listRelayerJobs",
  "listCollections",
  "getInfo",
]

async function query(call, callback) {
  const { method, query, nocache } = call.request
  let [func, contractTxId] = method.split("@")
  const allowed_contracts = map(v => v.split("@")[0])(
    isNil(config.contractTxId)
      ? []
      : is(Array, config.contractTxId)
      ? config.contractTxId
      : [config.contractTxId]
  )
  contractTxId ||= (
    is(Array, config.contractTxId)
      ? config.contractTxId[0]
      : config.contractTxId
  ).split("@")[0]
  if (
    allowed_contracts.length !== 0 &&
    !includes(contractTxId)(allowed_contracts)
  ) {
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
  const start = Date.now()
  const key = md5(`${contractTxId}:${func}:${query}`)
  let result = null
  let err = null
  let end

  function cb(result, err) {
    callback(null, {
      result: JSON.stringify(result),
      err: err,
    })
  }

  const sendQuery = async () => {
    const nameMap = { get: "getCache", cget: "cgetCache" }
    try {
      if (includes(func)(["get", "cget", "getNonce"])) {
        if (nocache && includes(func)(["get", "cget"])) {
          result = await sdks[contractTxId][func](...JSON.parse(query))
        } else {
          result = await sdks[contractTxId][nameMap[func] || func](
            ...JSON.parse(query)
          )
        }
      } else if (includes(func)(reads)) {
        result = await sdks[contractTxId][func](...JSON.parse(query))
        _cache[key] = { date: Date.now(), result }
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

  if (includes(func)(reads) && !isNil(_cache[key]) && !nocache) {
    result = _cache[key].result
    cb(result, err)
    await sendQuery()
  } else {
    ;({ result, err } = await sendQuery())
    cb(result, err)
  }
}

async function initSDK(v) {
  let _config = clone(config)
  let [txid, old] = v.split("@")
  _config.contractTxId = txid
  if (old === "old") _config.old = true
  sdks[txid] = new SDK(_config)
  if (isNil(_config.wallet)) await sdks[txid].initializeWithoutWallet()
  await sdks[txid].db.readState()
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
