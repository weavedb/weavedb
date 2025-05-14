const DFXWebPackConfig = require("./dfx.webpack.config")
DFXWebPackConfig.initCanisterIds()
const { join } = require("node:path")
const { access, symlink } = require("node:fs/promises")
const webpack = require("webpack")

// Make DFX_NETWORK available to Web Browser with default "local" if DFX_NETWORK is undefined
const EnvPlugin = new webpack.EnvironmentPlugin({
  DFX_NETWORK: "local",
})

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Plugin
    config.plugins.push(EnvPlugin)
    // Important: return the modified config
    config.experiments = { asyncWebAssembly: true }
    config.plugins.push(
      new (class {
        apply(compiler) {
          compiler.hooks.afterEmit.tapPromise(
            "SymlinkWebpackPlugin",
            async compiler => {
              if (isServer) {
                const from = join(compiler.options.output.path, "../static")
                const to = join(compiler.options.output.path, "static")

                try {
                  await access(from)
                  console.log(`${from} already exists`)
                  return
                } catch (error) {
                  if (error.code === "ENOENT") {
                    // No link exists
                  } else {
                    throw error
                  }
                }

                await symlink(to, from, "junction")
                console.log(`created symlink ${from} -> ${to}`)
              }
            }
          )
        }
      })()
    )
    return config
  },
  output: "export",
}
