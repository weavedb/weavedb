const SDK = require("../sdk")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const Wallet = require("ethereumjs-wallet").default

const { isNil } = require("ramda")
const ArLocal = require("arlocal").default

async function addFunds(arweave, wallet) {
  const walletAddress = await arweave.wallets.getAddress(wallet)
  await arweave.api.get(`/mint/${walletAddress}/1000000000000000`)
}

let arlocal,
  arweave,
  warp,
  arweave_wallet,
  wallet,
  wallet2,
  wallet3,
  wallet4,
  walletAddress,
  contractSrc,
  sdk

let isInit = false
let stopto = null
async function init() {
  if (isInit === false) {
    isInit = true
    arlocal = new ArLocal(1820, false)
    await arlocal.start()
  } else {
    clearTimeout(stopto)
  }
  sdk = new SDK({
    arweave: {
      host: "localhost",
      port: 1820,
      protocol: "http",
    },
  })
  arweave = sdk.arweave
  warp = sdk.warp
  return sdk
}
async function stop() {
  stopto = setTimeout(async () => {
    await arlocal.stop()
  }, 1000)
  return
}

async function initBeforeEach(secure = false) {
  wallet = Wallet.generate()
  wallet2 = Wallet.generate()
  wallet3 = Wallet.generate()
  wallet4 = Wallet.generate()
  arweave_wallet = await arweave.wallets.generate()
  await addFunds(arweave, arweave_wallet)
  walletAddress = await arweave.wallets.jwkToAddress(arweave_wallet)

  contractSrc = fs.readFileSync(
    path.join(__dirname, "../dist/contract.js"),
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
      secure,
      owner: walletAddress,
    },
  }
  const { contractTxId } = await warp.createContract.deploy({
    wallet: arweave_wallet,
    initState: JSON.stringify(initialState),
    src: contractSrc,
  })
  const name = "weavedb"
  const version = "1"
  sdk.initialize({
    contractTxId,
    wallet: arweave_wallet,
    name,
    version,
    EthWallet: wallet,
  })
  await sdk.mineBlock()

  return {
    wallet,
    walletAddress,
    contractSrc,
    wallet,
    wallet2,
    wallet3,
    wallet4,
    arweave_wallet,
  }
}

module.exports = {
  addFunds,
  init,
  initBeforeEach,
  stop,
}
