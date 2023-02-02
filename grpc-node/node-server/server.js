const Cache = require("./cache")
const archiver = require("archiver")
const extract = require("extract-zip")
const fs = require("fs")
const path = require("path")
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
let redis = null
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

let gcsBucket = null
let s3Ins = null

const isLmdb = (config.cache || "lmdb") === "lmdb"
const cacheDirPath = path.resolve(__dirname, "cache/warp")
if (!isNil(config.gcs)) {
  try {
    const { Storage } = require("@google-cloud/storage")
    const gcs = path.resolve(__dirname, config.gcs.keyFilename)
    const storage = new Storage({ keyFilename: gcs })
    gcsBucket = storage.bucket(config.gcs.bucket)
  } catch (e) {
    console.log(e)
  }
} else if (
  !isNil(config.s3) &&
  !isNil(config.s3.bucket) &&
  !isNil(config.s3.prefix)
) {
  try {
    const accessKeyId = !isNil(config.s3.accessKeyId)
      ? config.s3.accessKeyId
      : process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = !isNil(config.s3.secretAccessKey)
      ? config.s3.secretAccessKey
      : process.env.AWS_SECRET_ACCESS_KEY
    const s3region = !isNil(config.s3.region)
      ? config.s3.region
      : process.env.AWS_REGION

    if (!isNil(accessKeyId) && !isNil(secretAccessKey) && !isNil(s3region)) {
      const { S3 } = require("aws-sdk")
      s3Ins = new S3({
        apiVersion: "2006-03-01",
        useDualstackEndpoint: true,
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        region: s3region,
      })
    } else {
      console.log("lacking s3 settings")
      console.log(`AWS_ACCESS_KEY_ID: ${accessKeyId}`)
      console.log(`AWS_SECRET_ACCESS_KEY: ${secretAccessKey}`)
      console.log(`AWS_REGION: ${s3region}`)
    }
  } catch (e) {
    console.log(e)
    s3Ins = null
  }
}

const cache = new Cache(config)

async function uploadToGCS(contractTxId) {
  const options = {
    destination: `${contractTxId}.zip`,
  }

  try {
    const filePath = path.resolve(cacheDirPath, `${contractTxId}.zip`)
    await gcsBucket.upload(filePath, options)
    console.log(`snapshot (${contractTxId}) saved!`)
  } catch (e) {
    console.log(e)
  }
}

async function uploadToS3(contractTxId) {
  console.log("uploadToS3")
  if (isNil(s3Ins)) return
  const filePath = path.resolve(cacheDirPath, `${contractTxId}.zip`)
  const destination = `${config.s3.prefix}${contractTxId}.zip`
  try {
    // console.log("filePath: ", filePath)
    fs.readFile(filePath, function (err, data) {
      if (err) throw err

      s3Ins
        .putObject({
          Bucket: config.s3.bucket,
          Key: destination,
          Body: data,
        })
        .promise()
        .then(() => {
          console.log(`snapshot(s3) (${contractTxId}) saved!`)
        })
    })
  } catch (e) {
    console.log(`snapshot(s3) (${contractTxId}) save error!`)
    console.log(e)
  }
}

async function saveSnapShotGCS(contractTxId) {
  const output = fs.createWriteStream(
    path.resolve(cacheDirPath, `${contractTxId}.zip`)
  )
  const archive = archiver("zip", {
    zlib: { level: 9 },
  })

  archive.on("error", function (err) {
    console.log(err)
  })
  output.on("close", () => uploadToGCS(contractTxId))

  archive.pipe(output)

  archive.directory(
    path.resolve(cacheDirPath, `${contractTxId}/state/`),
    "state"
  )
  archive.directory(
    path.resolve(cacheDirPath, `${contractTxId}/contracts/`),
    "contracts"
  )
  archive.finalize()
}

async function saveSnapShotS3(contractTxId) {
  console.log("saveSnapShotS3")
  if (isNil(s3Ins)) return
  const output = fs.createWriteStream(
    path.resolve(cacheDirPath, `${contractTxId}.zip`)
  )
  const archive = archiver("zip", {
    zlib: { level: 9 },
  })

  archive.on("error", function (err) {
    console.log(err)
  })

  output.on("close", () => uploadToS3(contractTxId))

  archive.pipe(output)
  archive.directory(
    path.resolve(cacheDirPath, `${contractTxId}/state/`),
    "state"
  )
  archive.directory(
    path.resolve(cacheDirPath, `${contractTxId}/contracts/`),
    "contracts"
  )
  archive.finalize()
}

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
      console.log("lets go...", contractTxId)
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

  const key = md5(`${contractTxId}:${func}:${query}`)
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
    result = await cache.get(key).result
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
  if (isLmdb) {
    _config.lmdb = {
      state: { dbLocation: `./cache/warp/${_config.contractTxId}/state` },
      contracts: {
        dbLocation: `./cache/warp/${_config.contractTxId}/contracts`,
      },
    }
    if (!isNil(gcsBucket)) {
      try {
        fs.mkdirSync(cacheDirPath, { recursive: true })
      } catch (e) {
        console.log(e)
      }
      try {
        const src = path.resolve(
          __dirname,
          `cache/warp/${_config.contractTxId}-downloaded.zip`
        )
        const dist = path.resolve(
          __dirname,
          `cache/warp/${_config.contractTxId}/`
        )

        await gcsBucket.file(`${_config.contractTxId}.zip`).download({
          destination: src,
        })
        await extract(src, { dir: dist })
        console.log(`snapshot(${_config.contractTxId}) downloaded!`)
      } catch (e) {
        console.log(e)
        console.log(`snapshot(${_config.contractTxId}])doesn't exist`)
      }
    } else if (!isNil(s3Ins)) {
      try {
        fs.mkdirSync(cacheDirPath, { recursive: true })
      } catch (e) {
        console.log(e)
      }
      try {
        const src = path.resolve(
          cacheDirPath,
          `${_config.contractTxId}-downloaded.zip`
        )
        const dist = path.resolve(cacheDirPath, `${_config.contractTxId}/`)
        // console.log("dist: ", dist)

        const s3key = `${config.s3.prefix}${_config.contractTxId}.zip`
        // console.log("s3key: ", s3key)
        const s3data = await s3Ins
          .getObject({
            Bucket: config.s3.bucket,
            Key: s3key,
          })
          .promise()
        if (isNil(s3data) || isNil(s3data.Body)) {
          console.log(
            `snapshot(${_config.contractTxId}) downloaded error! (s3)`
          )
          return
        }

        fs.writeFile(src, s3data.Body, err => {
          if (err) {
            console.error(err)
          }
          // file written successfully
          console.log(`snapshot(${_config.contractTxId}) downloaded! (s3)`)
          extract(src, { dir: dist }).then(() => {
            // extracted successfully
            console.log(`snapshot(${_config.contractTxId}) extracted! (s3)`)
          })
        })
      } catch (e) {
        console.log(e)
        console.log(`snapshot(${_config.contractTxId}])doesn't exist (s3)`)
      }
    }
  }
  sdks[txid] = new SDK(_config)
  if (isNil(_config.wallet)) await sdks[txid].initializeWithoutWallet()
  await sdks[txid].db.readState()
  if (!isNil(gcsBucket)) saveSnapShotGCS(txid)
  else if (!isNil(s3Ins)) saveSnapShotS3(txid)

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
