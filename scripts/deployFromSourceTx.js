require("dotenv").config()
const fs = require("fs")
const path = require("path")
const Arweave = require("arweave")
const { isNil } = require("ramda")
const wallet_name = process.argv[2]
const srcTxId = process.argv[3] || process.env.SOURCE_TX_ID
const contractTxId_Intmax = process.argv[4] || process.env.INTMAX_SOURCE_TX_ID
const contractTxId_II = process.argv[5] || process.env.II_SOURCE_TX_ID
const contractTxId_ETH = process.argv[6] || process.env.ETH_SOURCE_TX_ID

const { Warp, WarpFactory, LoggerFactory } = require("warp-contracts")

if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}
let warp, arweave, walletAddress, wallet

const deploy = async () => {
  arweave = Arweave.init({
    host: wallet_name === "mainnet" ? "arweave.net" : "testnet.redstone.tools",
    port: 443,
    protocol: "https",
  })
  LoggerFactory.INST.logLevel("error")
  warp = WarpFactory.forMainnet()
  const wallet_path = path.resolve(
    __dirname,
    `.wallets/wallet-${wallet_name}.json`
  )
  if (!fs.existsSync(wallet_path)) {
    console.log("wallet doesn't exist: " + wallet_path)
    process.exit()
  }
  wallet = JSON.parse(fs.readFileSync(wallet_path, "utf8"))
  walletAddress = await arweave.wallets.jwkToAddress(wallet)

  const contractSrc = fs.readFileSync(
    path.join(__dirname, "../dist/warp/contract.js"),
    "utf8"
  )
  const stateFromFile = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../dist/warp/initial-state.json"),
      "utf8"
    )
  )

  const initialState = {
    ...stateFromFile,
    ...{
      owner: walletAddress,
    },
  }
  initialState.contracts.intmax = contractTxId_Intmax
  initialState.contracts.dfinity = contractTxId_II
  initialState.contracts.ethereum = contractTxId_ETH

  const res = await warp.createContract.deployFromSourceTx({
    wallet,
    initState: JSON.stringify(initialState),
    srcTxId,
  })
  console.log(res)
  process.exit()
}

deploy()
