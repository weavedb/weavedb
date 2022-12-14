const EthCrypto = require("eth-crypto")
require("dotenv").config()
const fs = require("fs")
const path = require("path")
const wallet_name = process.argv[2]
const functionId = process.argv[3]
const oldFunctionId = process.argv[4]
const { isNil } = require("ramda")
const SDK = require("../sdk-exm-web")

if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}

if (isNil(functionId) || isNil(oldFunctionId)) {
  console.log("contract not specified")
  process.exit()
}

const setup = async () => {
  const db = new SDK({
    functionId,
  })
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

  console.log("evolve WeaveDB..." + functionId + " from " + oldFunctionId)
  await db.evolve(oldFunctionId, { ar: wallet })
  console.log("evolved!")
  process.exit()
}

setup()
