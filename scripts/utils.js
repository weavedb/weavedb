const fs = require("fs")
const path = require("path")
const SDK = require("weavedb-sdk-node")
const { isNil } = require("ramda")

const send = async (sdk, wallet, queries) => {
  try {
    let i = 0
    for (const q of queries) {
      const tx = await sdk[q.func](...q.query, {
        ar: wallet,
      })
      if (tx.success) {
        console.log(q.msg)
      } else {
        throw new Error()
      }
    }
  } catch (e) {
    console.log(e)
    console.log("something went wrong")
  }
}

const initSetup = async ({ wallet_name, contractTxId, network }) => {
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
    contractTxId,
    network,
    nocache: true,
  })

  console.log("init WeaveDB..." + contractTxId)
  const addr = await sdk.arweave.wallets.jwkToAddress(wallet)
  return { sdk, wallet, addr }
}

const getArgv = (...args) => {
  let argv = {}
  let i = 0
  for (const v of args) {
    if (isNil(process.argv[2 + i])) {
      console.log(`${v} not specified`)
      process.exit()
    }
    argv[v] = process.argv[2 + i]
    i++
  }
  return argv
}
module.exports = {
  send,
  initSetup,
  getArgv,
}
