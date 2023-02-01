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
  // },
  cache: "lmdb", // or "leveldb"
  // redis: {
  //   url: `redis://${process.env.REDISPORT}:${process.env.REDISPORT}`,
  // }
}
