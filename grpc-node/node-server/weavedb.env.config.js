// redis
const { isNil } = require("ramda")

const redishost = process.env.REDISHOST ? process.env.REDISHOST : "localhost"
const redisport = process.env.REDISPORT ? process.env.REDISPORT : 6379
const subscribe = process.env.SUBSCRIBE == "true" ? true : false
const s3snapshot = process.env.S3_SNAPSHOT == "true" ? true : false
const accessKeyId = process.env.S3_AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.S3_AWS_SECRET_ACCESS_KEY
const s3bucket = process.env.S3_AWS_BUCKET
const s3prefix = process.env.S3_AWS_PREFIX
const s3region = process.env.S3_AWS_REGION
const wallet_string = process.env.ARWEAVE_WALLET_CREDENTIAL
let wallet = {}
if (!isNil(wallet_string) && wallet_string!="") {
  try {
    wallet = JSON.parse(wallet_string)
  } catch(e) {
    console.log("WARNING: wrong wallet setting")
    console.log(e.message)
  }
}
// wallet = require("wallet.json")

const cacheengine =
  process.env.CACHE_ENGINE == "redis"
    ? "redis"
    : process.env.CACHE_ENGINE == "leveldb"
    ? "leveldb"
    : "lmdb"

const adminContractTxId = process.env.ADMIN_CONTRACT_TX_ID
  ? process.env.ADMIN_CONTRACT_TX_ID
  : "" // "XoHBBLZfrrpQIcvnrsWs69OoHfXwWMQWdAbYOifcTQA"
const contractTxId = process.env.CONTRACT_TX_ID

let config = {
  subscribe: subscribe,
  cache: cacheengine,
  redis: `redis://${redishost}:${redisport}`,
}
if (!isNil(contractTxId) && contractTxId != "") {
  config["contractTxId"] = contractTxId
}
if (!isNil(adminContractTxId) && adminContractTxId != "" && !isNil(wallet)) {
  config["admin"] = {
    contractTxId: adminContractTxId,
    owner: wallet,
  }
}
if (
  !isNil(s3snapshot) && 
  s3snapshot &&
  !isNil(accessKeyId) &&
  accessKeyId != "" &&
  !isNil(secretAccessKey) &&
  secretAccessKey != "" &&
  !isNil(s3bucket) &&
  s3bucket != "" &&
  !isNil(s3prefix) &&
  !isNil(s3region) &&
  s3region != ""
) {
  config["s3"] = {
    bucket: s3bucket,
    prefix: s3prefix,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: s3region,
  }
}

module.exports = config
