const { build } = require("esbuild")
const replace = require("replace-in-file")
const contracts = [
  "/weavedb-kv/contract.js",
  "/warp/contract.js",
  "/intercall/contract.js",
  "/intmax/intmax.js",
  "/internet-identity/ii.js",
  "/ethereum/eth.js",
  "/ethereum/eth-exm.js",
  "/poseidon/poseidonConstants.js",
  "/exm/exm.js",
]

build({
  entryPoints: contracts.map(source => {
    return `./contracts${source}`
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
