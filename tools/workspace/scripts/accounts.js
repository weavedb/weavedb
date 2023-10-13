const { readFileSync, readdirSync } = require("fs")
const { resolve } = require("path")
let config = require("../weavedb.config.js")
let accounts = config.accounts
const Arweave = require("arweave")
const arweave = Arweave.init()
const dir = resolve(__dirname, "../.weavedb/accounts")
const dir_evm = resolve(__dirname, "../.weavedb/accounts/evm")
const dir_ar = resolve(__dirname, "../.weavedb/accounts/ar")

const main = async () => {
  for (const v of readdirSync(dir_evm)) {
    const acc = JSON.parse(readFileSync(resolve(dir_evm, v), "utf8"))
    const name = v.split(".")[0]
    accounts.evm[name] = acc
  }
  for (const v of readdirSync(dir_ar)) {
    const acc = JSON.parse(readFileSync(resolve(dir_ar, v), "utf8"))
    const name = v.split(".")[0]
    accounts.ar[name] = acc
  }
  console.log()
  console.log("EVM accounts:")
  for (const k in accounts.evm) {
    console.log(`[${k}]\t${accounts.evm[k].address}`)
  }
  console.log()
  console.log("Arweave accounts:")
  for (const k in accounts.ar) {
    const addr = await arweave.wallets.jwkToAddress(accounts.ar[k])
    console.log(`[${k}]\t${addr}`)
  }
  console.log()
}

main()
