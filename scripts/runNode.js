const readline = require("readline")
const { stdin: input, stdout: output } = require("process")
const rl = readline.createInterface({ input, output })
const SDK = require("../sdk")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const ethSigUtil = require("@metamask/eth-sig-util")
const Wallet = require("ethereumjs-wallet").default
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
  arlocal = new ArLocal(1820, false)
  await arlocal.start()
  sdk = new SDK({
    arweave: {
      host: "localhost",
      port: 1820,
      protocol: "http",
    },
  })
  arweave = sdk.arweave
  warp = sdk.warp
  const wallet = Wallet.generate()
  arweave_wallet = await arweave.wallets.generate()
  await addFunds(arweave, arweave_wallet)
  walletAddress = await arweave.wallets.jwkToAddress(arweave_wallet)
  console.log(`Arweave wallet generated: ` + walletAddress)
  console.log(`Ethereum wallet generated: ` + wallet.getAddressString())
  contractSrc = fs.readFileSync(
    path.join(__dirname, "../dist/contracts/contract.js"),
    "utf8"
  )
  const stateFromFile = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../dist/contracts/initial-state.json"),
      "utf8"
    )
  )
  const initialState = {
    ...stateFromFile,
    ...{
      secure: true,
      owner: walletAddress,
    },
  }
  const contract = await warp.createContract.deploy({
    wallet: arweave_wallet,
    initState: JSON.stringify(initialState),
    src: contractSrc,
  })
  console.log(contract)
  const name = "weavedb"
  const version = "1"
  sdk.initialize({
    contractTxId: contract.contractTxId,
    wallet: arweave_wallet,
    name,
    version,
    EthWallet: wallet,
  })
  await sdk.mineBlock()
  const metadata = {
    ethereum: {
      privateKey: wallet.getPrivateKeyString(),
      publicKey: wallet.getPublicKeyString(),
      address: wallet.getAddressString(),
    },
    arweave: arweave_wallet,
    weavedb: { ...contract, name, version },
  }
  fs.writeFileSync(
    path.resolve(__dirname, "../console/lib/weavedb.json"),
    JSON.stringify(metadata)
  )
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
  rl.question("> ", async method => {
    try {
      let pr = eval(`sdk.${method}`)
      const res = await pr
      if (!isNil(res.err)) {
        console.log(`error: ${res.err.errorMessage}`)
      } else {
        console.log(res)
      }
    } catch (e) {
      console.log(e)
    }
    waitForCommand()
  })
}
init()
