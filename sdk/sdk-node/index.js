const SDK = require("weavedb-sdk")
class SDKNODE extends SDK {
  constructor(param) {
    super(param)
    const { LmdbCache } = require("warp-contracts-lmdb")
    const { createClient } = require("redis")
    const {
      WarpSubscriptionPlugin,
    } = require("./warp-contracts-plugin-subscription")
    this.LmdbCache = LmdbCache
    this.createClient = createClient
    this.WarpSubscriptionPlugin = WarpSubscriptionPlugin
  }
}

module.exports = SDKNODE
