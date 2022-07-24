const path = require("path")
const withOffline = require("next-offline")
const compose = require("ramda/src/compose")
const forEach = require("ramda/src/forEach")
const reduce = require("ramda/src/reduce")
const concat = require("ramda/src/concat")
const filter = require("ramda/src/filter")
const values = require("ramda/src/values")
const pluck = require("ramda/src/pluck")
const isNil = require("ramda/src/isNil")
const complement = require("ramda/src/complement")

const nextConfig = {
  target: "serverless",
  transformManifest: manifest => ["/"].concat(manifest),
  generateInDevMode: true,
  generateSw: false,
  workboxOpts: {
    swDest: "static/service-worker.js",
    swSrc: __dirname + "/nd/sw.js"
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    compose(
      forEach(
        v =>
          (config.resolve.alias[v] = path.resolve(
            __dirname,
            `node_modules/${v}`
          ))
      ),
      reduce(concat, ["recoil", "ramda"]),
      filter(complement(isNil)),
      pluck("peer"),
      values
    )(require("./nd/.plugins"))
    return config
  }
}

module.exports = withOffline(nextConfig)
