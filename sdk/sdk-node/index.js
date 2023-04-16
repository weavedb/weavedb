//const SDK = require("weavedb-sdk")
const SDK = require("../sdk-web")
class SDKNODE extends SDK {
  constructor(param) {
    const { LmdbCache } = require("warp-contracts-lmdb")
    const { createClient } = require("redis")
    const {
      WarpSubscriptionPlugin,
    } = require("./warp-contracts-plugin-subscription")
    super({
      ...{ LmdbCache, createClient, WarpSubscriptionPlugin },
      ...param,
    })
  }
}

module.exports = SDKNODE
