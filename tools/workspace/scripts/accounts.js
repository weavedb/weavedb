const accounts = require("./lib/accounts")
const Arweave = require("arweave")
const arweave = Arweave.init()

const main = async () => {
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
