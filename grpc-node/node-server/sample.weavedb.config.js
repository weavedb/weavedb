module.exports = {
  contractTxId: "1gU_EmELb5-sqqlURuBQFCD0HTlBxHLLZhUojIXxj78",
  arweave: {
    host: "arweave.net",
    port: 443,
    protocol: "https",
  },
  subscribe: true,
  // s3: {
  //   bucket: 'BUCKET_NAME',
  //   prefix: 'PREFIX/',
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //   region: process.env.AWS_REGION,
  // },
  cache: "lmdb", // or "leveldb"
  // redis: {
  //   url: `redis://${process.env.REDISPORT}:${process.env.REDISPORT}`,
  // }
}

