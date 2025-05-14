const EthCrypto = require("eth-crypto")
const { isNil } = require("ramda")
const {
  _: [name],
  t = "evm",
} = require("yargs")(process.argv.slice(2)).argv
const Arweave = require("arweave")
if (isNil(name)) {
  console.error("account name missing")
  process.exit()
}
const { mkdirSync, existsSync, writeFileSync } = require("fs")
const { resolve } = require("path")
const dir_conf = resolve(__dirname, "../.weavedb")
const dir = resolve(__dirname, "../.weavedb/accounts")
const dir_evm = resolve(__dirname, "../.weavedb/accounts/evm")
const dir_ar = resolve(__dirname, "../.weavedb/accounts/ar")
const dirs = [dir_conf, dir, dir_evm, dir_ar]
const config = require("../weavedb.config.js")
const mkdir = async () => {
  for (let v of dirs) {
    if (!existsSync(v)) mkdirSync(v)
  }
}

const main = async () => {
  await mkdir()
  const keyfile = resolve(dir, t, `${name}.json`)
  if (!isNil(config?.accounts?.[t]?.[name]) || existsSync(keyfile)) {
    console.error(`account [${name}:${t}] exists`)
    process.exit()
  }
  if (t === "evm") {
    const identity = EthCrypto.createIdentity()
    console.log(`[${name}] EVM account generated!`)
    console.log(identity.address)
    writeFileSync(keyfile, JSON.stringify(identity))
  } else if (t === "ar") {
    const arweave = Arweave.init()
    const wallet = await arweave.wallets.generate()
    const addr = await arweave.wallets.jwkToAddress(wallet)
    console.log(`[${name}] Arweave account generated!`)
    console.log(addr)
    writeFileSync(keyfile, JSON.stringify(wallet))
  } else {
    console.error(`unknown type: ${t}`)
  }
}
main()
