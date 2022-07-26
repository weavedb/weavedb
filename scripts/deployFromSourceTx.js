require("dotenv").config()
const fs = require("fs")
const path = require("path")
const Arweave = require("arweave")
const wallet_name = process.argv[2]
const { isNil } = require("ramda")
const srcTxId = process.argv[3] || process.env.SOURCE_TX_ID
const {
  PstContract,
  PstState,
  Warp,
  WarpNodeFactory,
  LoggerFactory,
  InteractionResult,
} = require("warp-contracts")

if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}
const deploy = async () => {
  const arweave = Arweave.init({
    host: wallet_name === "mainnet" ? "arweave.net" : "testnet.redstone.tools",
    port: 443,
    protocol: "https",
  })
  LoggerFactory.INST.logLevel("error")
  const warp = WarpNodeFactory.memCachedBased(arweave).useWarpGateway().build()
  const wallet_path = path.resolve(
    __dirname,
    !isNil(process.argv[4])
      ? process.env.PWD + "/" + process.argv[4]
      : `.wallets/wallet-${wallet_name}.json`
  )
  if (!fs.existsSync(wallet_path)) {
    console.log("wallet doesn't exist")
    process.exit()
  }
  const wallet = JSON.parse(fs.readFileSync(wallet_path, "utf8"))

  const contractSrc = fs.readFileSync(
    path.join(__dirname, "../dist/contract.js"),
    "utf8"
  )
  const stateFromFile = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../dist/contracts/initial-state.json"),
      "utf8"
    )
  )
  const walletAddress = await arweave.wallets.jwkToAddress(wallet)

  const initialState = {
    ...stateFromFile,
    ...{
      owner: walletAddress,
    },
  }

  const res = await warp.createContract.deployFromSourceTx(
    {
      wallet,
      initState: JSON.stringify(initialState),
      srcTxId,
    },
    wallet_name === "mainnet"
  )
  console.log(res)
  process.exit()
}

deploy()
