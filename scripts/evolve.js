const EthCrypto = require("eth-crypto")
require("dotenv").config()
const fs = require("fs")
const path = require("path")
const wallet_name = process.argv[2]
const contractTxId = process.argv[3] || process.env.CONTRACT_TX_ID
const newContractSrcTxId = process.argv[4] || process.env.NEW_SOURCE_TX_ID
const newIntmaxTxId = process.argv[5] || process.env.INTMAX_CONTRACT_TX_ID
const name = process.argv[6] || process.env.APP_NAME
const { isNil } = require("ramda")
const SDK = require("../sdk")

if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}

if (isNil(contractTxId)) {
  console.log("contract not specified")
  process.exit()
}

if (isNil(newIntmaxTxId)) {
  console.log("intmax contract not specified")
  process.exit()
}

const setup = async () => {
  const wallet_path = path.resolve(
    __dirname,
    ".wallets",
    `wallet-${wallet_name}.json`
  )
  if (!fs.existsSync(wallet_path)) {
    console.log("wallet doesn't exist")
    process.exit()
  }
  const wallet = JSON.parse(fs.readFileSync(wallet_path, "utf8"))
  const sdk = new SDK({
    wallet,
    name,
    version: "1",
    contractTxId,
    arweave: {
      host:
        wallet_name === "mainnet" ? "arweave.net" : "testnet.redstone.tools",
      port: 443,
      protocol: "https",
      timeout: 200000,
    },
  })
  console.log("evolve WeaveDB..." + contractTxId + " to " + newContractSrcTxId)
  await sdk.db.evolve(newContractSrcTxId, true)
  console.log("evolved!")
  await sdk.linkContract("intmax", newIntmaxTxId, { ar: wallet })
  console.log("intmax contract linked!")
  process.exit()
}

setup()
