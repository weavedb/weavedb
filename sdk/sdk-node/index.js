const SDK = require("weavedb-sdk")
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
    this.isNode = true
  }
}

module.exports = SDKNODE
