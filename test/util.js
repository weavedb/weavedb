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
  walletAddress,
  contractSrc,
  initialState,
  sdk

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
  return { arlocal, sdk }
}

async function initBeforeEach(secure = false) {
  wallet = Wallet.generate()
  wallet2 = Wallet.generate()
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
  initialState = {
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
  const name = "asteroid"
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
    arweave_wallet,
  }
}

module.exports = {
  addFunds,
  init,
  initBeforeEach,
}
