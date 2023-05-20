require("dotenv").config()
let { wallet = null } = require("yargs")(process.argv.slice(2)).argv

const fs = require("fs")
const path = require("path")
const Arweave = require("arweave")
const { isNil } = require("ramda")
const wallet_name = process.argv[2]
const srcTxId = process.argv[3] || process.env.SOURCE_TX_ID
//const contractTxId_Intmax = process.argv[4] || process.env.INTMAX_SOURCE_TX_ID
const contractTxId_II = process.argv[4] || process.env.II_SOURCE_TX_ID
const contractTxId_ETH = process.argv[5] || process.env.ETH_SOURCE_TX_ID

const { Warp, WarpFactory, LoggerFactory } = require("warp-contracts")
const { DeployPlugin, ArweaveSigner } = require("warp-contracts-plugin-deploy")

if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}
let warp, arweave, walletAddress, _wallet

const deploy = async () => {
  arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  })

  LoggerFactory.INST.logLevel("error")
  warp = WarpFactory.forMainnet().use(new DeployPlugin())
  const wallet_path = path.resolve(
    __dirname,
    `.wallets/wallet-${wallet || wallet_name}.json`
  )
  if (!fs.existsSync(wallet_path)) {
    console.log("wallet doesn't exist: " + wallet_path)
    process.exit()
  }
  _wallet = JSON.parse(fs.readFileSync(wallet_path, "utf8"))
  walletAddress = await arweave.wallets.jwkToAddress(_wallet)
  const stateFromFile = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../dist/weavedb-kv/initial-state.json"),
      "utf8"
    )
  )

  const initialState = {
    ...stateFromFile,
    ...{
      owner: walletAddress,
      evaluationManifest: {
        evaluationOptions: {
          useKVStorage: true,
        },
      },
    },
  }
  // initialState.contracts.intmax = contractTxId_Intmax
  initialState.contracts.dfinity = contractTxId_II
  initialState.contracts.ethereum = contractTxId_ETH
  const res = await warp.createContract.deployFromSourceTx({
    wallet: new ArweaveSigner(_wallet),
    initState: JSON.stringify(initialState),
    srcTxId,
  })
  console.log(res)

  process.exit()
}

deploy()
