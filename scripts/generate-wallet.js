const fs = require("fs")
const path = require("path")
const Arweave = require("arweave")
const wallet_name = process.argv[2]
const { isNil } = require("ramda")

if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}

const gen = async () => {
  const arweave = Arweave.init({
    host: "testnet.redstone.tools",
    port: 443,
    protocol: "https",
  })
  const wallet_dir_path = path.resolve(__dirname, ".wallets")
  const wallet_path = path.resolve(
    wallet_dir_path,
    `wallet-${wallet_name}.json`
  )
  if (fs.existsSync(wallet_path)) {
    console.log("wallet exists")
    process.exit()
  }
  const wallet = await arweave.wallets.generate()
  if (!fs.existsSync(wallet_dir_path)) fs.mkdirSync(wallet_dir_path)
  fs.writeFileSync(wallet_path, JSON.stringify(wallet))
  const walletAddress = await arweave.wallets.jwkToAddress(wallet)

  console.log(`A new wallet (${walletAddress}) saved at ${wallet_path}`)
}

gen()
