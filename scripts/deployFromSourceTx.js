require("dotenv").config()
const fs = require("fs")
const path = require("path")
const Arweave = require("arweave")
const { isNil } = require("ramda")
const wallet_name = process.argv[2]
const srcTxId = process.argv[3] || process.env.SOURCE_TX_ID
const contractTxId_Intmax = process.argv[4] || process.env.INTMAX_SOURCE_TX_ID

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
let warp, arweave, walletAddress, wallet

async function deployContractIntmax() {
  const contractSrc = fs.readFileSync(
    path.join(__dirname, "../dist/intmax/intmax.js"),
    "utf8"
  )
  const stateFromFile = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../dist/intmax/initial-state-intmax.json"),
      "utf8"
    )
  )
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
      srcTxId: contractTxId_Intmax,
    },
    wallet_name === "mainnet"
  )
  console.log(res)
  return res.contractTxId
}

const deploy = async () => {
  arweave = Arweave.init({
    host: wallet_name === "mainnet" ? "arweave.net" : "testnet.redstone.tools",
    port: 443,
    protocol: "https",
  })
  LoggerFactory.INST.logLevel("error")
  warp = WarpNodeFactory.memCachedBased(arweave).useWarpGateway().build()
  const wallet_path = path.resolve(
    __dirname,
    !isNil(process.argv[5])
      ? process.env.PWD + "/" + process.argv[5]
      : `.wallets/wallet-${wallet_name}.json`
  )
  if (!fs.existsSync(wallet_path)) {
    console.log("wallet doesn't exist")
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
