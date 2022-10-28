const { build } = require("esbuild")
const replace = require("replace-in-file")
const contracts = [
  "/contracts/contract.js",
  "/contracts/intmax.js",
  "/contracts/poseidonConstants.js",
  "/contracts-exm/exm.js",
]

build({
  entryPoints: contracts.map(source => {
    return `./src${source}`
  }),
  outdir: "./dist",
  minify: false,
  bundle: true,
  format: "iife",
})
  .catch(() => process.exit(1))
  // note: Warp SDK currently does not support files in IIFE bundle format, so we need to remove the "iife" part ;-)
  // update: it does since 0.4.31, but because viewblock.io is still incompatibile with this version, leaving as is for now.
  .finally(() => {
    const files = contracts.map(source => {
      return `./dist${source}`
    })
    replace.sync({
      files: files,
      from: [/\(\(\) => {/g, /}\)\(\);/g],
      to: "",
      countMatches: true,
    })
  })
