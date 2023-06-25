const { build } = require("esbuild")
const contracts = ["/eth-crypto/public-key.js"]
build({
  entryPoints: contracts.map(src => `.${src}`),
  outdir: "./dist",
  minify: false,
  bundle: true,
  platform: "node",
})
  .catch(() => process.exit(1))
  .finally(() => {
    const files = contracts.map(source => `./dist${source}`)
  })
