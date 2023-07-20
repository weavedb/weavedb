const fs = require("fs")
const path = require("path")
const Arweave = require("arweave")
const wallet_name = process.argv[2]
const contractType = (process.argv[3] || 1) * 1
//const contractTxIdIntmax = process.argv[3]
const contractTxIdInternetIdentity = process.argv[4]
const contractTxIdEthereum = process.argv[5]
const contractTxIdBundler = process.argv[6]
const { isNil } = require("ramda")
const { WarpFactory, LoggerFactory } = require("warp-contracts")
const { DeployPlugin, ArweaveSigner } = require("warp-contracts-plugin-deploy")

if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}

let warp, walletAddress, arweave, wallet

async function deployContract(secure) {
  const contractSrc = fs.readFileSync(
    path.join(
      __dirname,
      `../dist/${
        contractType === 1
          ? "weavedb"
          : contractType === 2
          ? "weavedb-kv"
          : "weavedb-bpt"
      }/contract.js`
    ),
    "utf8"
  )
  const stateFromFile = JSON.parse(
    fs.readFileSync(
      path.join(
        __dirname,
        `../dist/${
          contractType === 1
            ? "weavedb"
            : contractType === 2
            ? "weavedb-kv"
            : "weavedb-bpt"
        }/initial-state.json`
      ),
      "utf8"
    )
  )
  let opt = {}
  if (contractType > 1) opt.useKVStorage = true
  let initialState = {
    ...stateFromFile,
    ...{
      owner: walletAddress,
    },
  }
  //initialState.contracts.intmax = contractTxIdIntmax
  initialState.contracts.dfinity = contractTxIdInternetIdentity
  initialState.contracts.ethereum = contractTxIdEthereum
  if (contractType === 3) initialState.contracts.bundler = contractTxIdBundler
  const res = await warp.createContract.deploy({
    wallet: new ArweaveSigner(wallet),
    initState: JSON.stringify(initialState),
    evaluationManifest: {
      evaluationOptions: opt,
    },
    src: contractSrc,
  })
  console.log("deployed WeaveDB contract")
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
  warp = WarpFactory.forMainnet().use(new DeployPlugin())
  const wallet_path = path.resolve(
    __dirname,
    ".wallets",
    `wallet-${wallet_name}.json`
  )

  if (!fs.existsSync(wallet_path)) {
    console.log("wallet doesn't exist")
    process.exit()
  }
  wallet = JSON.parse(fs.readFileSync(wallet_path, "utf8"))
  walletAddress = await arweave.wallets.jwkToAddress(wallet)
  await deployContract(true)
  process.exit()
}

deploy()
