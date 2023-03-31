const { build } = require("esbuild")
const replace = require("replace-in-file")
const contracts = ["/webauthn"]

build({
  entryPoints: contracts.map(source => {
    return `./${source}`
  }),
  outdir: "./dist2",
  minify: false,
  bundle: true,
  format: "iife",
  platform: "node",
})
  .catch(() => process.exit(1))
  .finally(() => {
    const files = contracts.map(source => {
      return `./dist2${source}`
    })
    replace.sync({
      files: files,
      from: [/\(\(\) => {/g, /}\)\(\);/g],
      to: "",
      countMatches: true,
    })
  })
