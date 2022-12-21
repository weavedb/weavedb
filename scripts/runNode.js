let {
  wallet = null,
  contractTxId,
  port = 1820,
  dbPath = null,
  persist = false,
  secure = false,
} = require("yargs")(process.argv.slice(2)).argv
const Constants = require("../src/intmax/lib/circomlibjs/poseidon_constants_opt.js")
const readline = require("readline")
const { stdin: input, stdout: output } = require("process")
const rl = readline.createInterface({ input, output })
const SDK = require("../sdk-node")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const ethSigUtil = require("@metamask/eth-sig-util")
const Wallet = require("ethereumjs-wallet").default
const { deployContracts } = require("../test/util")
const {
  PstContract,
  PstState,
  Warp,
  WarpNodeFactory,
  LoggerFactory,
  InteractionResult,
} = require("warp-contracts")
const { isNil, keys, includes } = require("ramda")
const ArLocal = require("arlocal").default

async function addFunds(arweave, wallet) {
  const walletAddress = await arweave.wallets.getAddress(wallet)
  await arweave.api.get(`/mint/${walletAddress}/1000000000000000`)
}

let arlocal, arweave, warp, arweave_wallet, walletAddress, contractSrc, sdk

let isInit = false
let stopto = null

async function init() {
  dbPath = isNil(dbPath)
    ? path.resolve(__dirname, ".db")
    : /^\//.test(dbPath)
    ? dbPath
    : path.resolve(process.cwd(), dbPath)
  if (persist) {
    console.log(`dbPath: ${dbPath}`)
  }
  arlocal = new ArLocal(port, false, dbPath, persist)
  await arlocal.start()
  let _arweave_wallet = null
  if (!isNil(wallet)) {
    const wallet_path = path.resolve(
      __dirname,
      ".wallets",
      `wallet-${wallet}.json`
    )
    if (!fs.existsSync(wallet_path)) {
      console.log("wallet doesn't exist: " + wallet_path)
      process.exit()
    }
    _arweave_wallet = JSON.parse(fs.readFileSync(wallet_path, "utf8"))
  }
  sdk = new SDK({
    arweave_wallet: _arweave_wallet,
    arweave: {
      host: "localhost",
      port,
      protocol: "http",
    },
  })
  arweave = sdk.arweave
  warp = sdk.warp

  const {
    contract,
    intmaxSrcTxId,
    dfinitySrcTxId,
    ethereumSrcTxId,
    poseidon1TxId,
    poseidon2TxId,
    arweave_wallet,
    walletAddress,
  } = await deployContracts({
    secure,
    warp,
    arweave,
    contractTxId,
    arweave_wallet: _arweave_wallet,
  })

  console.log()
  console.log(`Arweave Wallet: ` + walletAddress)

  if (isNil(contractTxId)) {
    console.log()
    console.log(`New DB instance deployed (secure: ${secure})`)
    console.log(contract)
    ;({ contractTxId } = contract)
  }
  const name = "weavedb"
  const version = "1"

  sdk.initialize({
    contractTxId,
    wallet: arweave_wallet,
    name,
    version,
  })
  await sdk.mineBlock()
  waitForCommand()
}

function waitForCommand() {
  const methods = [
    "add",
    "get",
    "cget",
    "set",
    "update",
    "upsert",
    "delete",
    "addIndex",
    "getIndex",
    "removeIndex",
    "setRules",
    "getRules",
    "setSchema",
    "getSchema",
    "nonce",
    "ids",
    "batch",
    "evolve",
  ]
  console.log()
  rl.question("> ", async method => {
    try {
      let pr = eval(`sdk.${method}`)
      const res = await pr
      if (!isNil(res.err)) {
        console.log(`error: ${res.err.errorMessage}`)
      } else {
        console.log(JSON.parse(JSON.stringify(res)))
      }
    } catch (e) {
      console.log(e)
    }
    waitForCommand()
  })
}
init()
