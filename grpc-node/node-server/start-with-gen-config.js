#!/usr/bin/env node

const { isNil } = require('ramda')
const fs = require('fs')

console.log('Generating weavedb.config.js file...')

const redishost = process.env.REDIS_HOST | 'redis'
const redisport = process.env.REDIS_HOST | '6379'
const redixprefix = process.env.REDIS_PREFIX | '6379'
const snapshot_span = process.env.SNAPSHOT_SPAN | (100 * 60 * 60 * 3) // every 3

const cacheengine =
  process.env.CACHE_ENGINE == 'redis'
    ? 'redis'
    : process.env.CACHE_ENGINE == 'leveldb'
    ? 'leveldb'
    : 'lmdb'

const adminContractTxId =
  process.env.ADMIN_CONTRACT_TX_ID |
  'XoHBBLZfrrpQIcvnrsWs69OoHfXwWMQWdAbYOifcTQA'
const contractTxId = process.env.CONTRACT_TX_ID | ''
const subscribe =
  process.env.SUBSCRIBE && process.env.SUBSCRIBE == 'true' ? true : false
const s3snapshot =
  process.env.S3_SNAPSHOT && process.env.S3_SNAPSHOT == 'true' ? true : false
const accessKeyId = process.env.S3_AWS_ACCESS_KEY_ID | ''
const secretAccessKey = process.env.S3_AWS_SECRET_ACCESS_KEY | ''
const s3bucket = process.env.S3_AWS_BUCKET | ''
const s3prefix = process.env.S3_AWS_PREFIX | ''
const wallet_string = process.env.ARWEAVE_WALLET_CREDENTIAL | ''
const s3region = process.env.S3_AWS_REGION | ''
const offchain_db_prefix = process.env.OFFCHAIN_DB_PREFIX | 'offchain'

let wallet = {}
if (!isNil(wallet_string) && wallet_string != '') {
  try {
    wallet = JSON.parse(wallet_string)
  } catch (e) {
    console.log('WARNING: wrong wallet setting')
    console.log(e.message)
  }
}

let config = {
  subscribe: subscribe,
  cache: cacheengine,
  snapshot: s3snapshot,
  redis: {
    url: `redis://${redishost}:${redisport}`,
    prefix: `${redixprefix}`,
  },
  offchain_db: {
    url: `redis://${redishost}:${redisport}`,
    prefix: offchain_db_prefix,
  },
}
if (!isNil(snapshot_span) && snapshot_span != '' && snapshot_span > 3600*1000) {
  config['snapshot_span'] = snapshot_span
}

if (!isNil(contractTxId) && contractTxId != '') {
  config['contractTxId'] = contractTxId
}
if (!isNil(adminContractTxId) && adminContractTxId != '' && !isNil(wallet)) {
  config['admin'] = {
    contractTxId: adminContractTxId,
    owner: wallet,
  }
}

if (
  !isNil(s3snapshot) &&
  s3snapshot &&
  !isNil(accessKeyId) &&
  accessKeyId != '' &&
  !isNil(secretAccessKey) &&
  secretAccessKey != '' &&
  !isNil(s3bucket) &&
  s3bucket != '' &&
  !isNil(s3prefix) &&
  !isNil(s3region) &&
  s3region != ''
) {
  config['s3'] = {
    bucket: s3bucket,
    prefix: s3prefix,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: s3region,
  }
}

const configJS = JSON.stringify(config)

// console.log("configJS: ", configJS)
fs.writeFile('./weavedb.config.js', `module.exports = ${configJS}`, err => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log('weavedb.config.js created')
  require('./server.js')
})
