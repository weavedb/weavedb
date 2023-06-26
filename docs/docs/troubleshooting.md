---
sidebar_position: 8
---

# Troubleshooting

### create-react-app

Some crypto libraries have issues with webpack5. Follow [this guide](https://www.alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5) with one addition.

You also need to install `constants-browserify` and add it to `config-overrides.js` in an appropriate place.

```js
const webpack = require("webpack")
module.exports = function override(config) {
  const fallback = config.resolve.fallback || {}
  Object.assign(fallback, {
    crypto: require.resolve("crypto-browserify"),
    constants: require.resolve("constants-browserify"),
    stream: require.resolve("stream-browserify"),
    assert: require.resolve("assert"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify"),
    url: require.resolve("url"),
  })
  config.resolve.fallback = fallback
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ])
  return config
}
```
### v0.27.x

To work with v0.27.x, you need to set `type: 2` when instanciating the SDK. This will turn on the KVS feature required for v0.27.x.

```js
import SDK from "weavedb-sdk"

const db = new SDK({ contractTxID, type: 2 })
await db.init()
```
