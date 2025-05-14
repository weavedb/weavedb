const { readFileSync, readdirSync } = require("fs")
const { resolve } = require("path")
const Arweave = require("arweave")
const arweave = Arweave.init()
const dir = resolve(__dirname, "../../.weavedb/accounts")
const dir_evm = resolve(__dirname, "../../.weavedb/accounts/evm")
const dir_ar = resolve(__dirname, "../../.weavedb/accounts/ar")
let config = require("../../weavedb.config.js")
config.accounts ??= {}
const accounts = config.accounts
config.accounts.evm ??= {}
config.accounts.ar ??= {}
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

module.exports = accounts
