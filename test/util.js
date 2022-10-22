const SDK = require("../sdk")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const Wallet = require("ethereumjs-wallet").default

const { isNil } = require("ramda")
const ArLocal = require("arlocal").default
const Constants = require("../src/contracts/lib/circomlibjs/poseidon_constants_opt.js")
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
  sdk,
  intmaxSrcTxId

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

async function deployContract(secure, contractTxIdIntmax) {
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
  let initialState = {
    ...stateFromFile,
    ...{
      secure,
      owner: walletAddress,
    },
  }
  initialState.contracts.intmax = contractTxIdIntmax
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
  return contractTxId
}

async function deployContractIntmax(
  contractTxIdPoseidon1,
  contractTxIdPoseidon2
) {
  const contractSrc = fs.readFileSync(
    path.join(__dirname, "../dist/intmax.js"),
    "utf8"
  )
  const stateFromFile = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../dist/contracts/initial-state-intmax.json"),
      "utf8"
    )
  )
  const initialState = {
    ...stateFromFile,
    ...{
      owner: walletAddress,
    },
  }
  initialState.contracts.poseidonConstants1 = contractTxIdPoseidon1
  initialState.contracts.poseidonConstants2 = contractTxIdPoseidon2
  const { contractTxId } = await warp.createContract.deploy({
    wallet: arweave_wallet,
    initState: JSON.stringify(initialState),
    src: contractSrc,
  })
  await arweave.api.get("mine")
  return contractTxId
}

async function deployContractPoseidon(poseidonConstants) {
  const contractSrc = fs.readFileSync(
    path.join(__dirname, "../dist/poseidonConstants.js"),
    "utf8"
  )
  const stateFromFile = JSON.parse(
    fs.readFileSync(
      path.join(
        __dirname,
        "../dist/contracts/initial-state-poseidon-constants.json"
      ),
      "utf8"
    )
  )
  const initialState = {
    ...stateFromFile,
    ...{
      owner: walletAddress,
      poseidonConstants,
    },
  }
  const { contractTxId } = await warp.createContract.deploy({
    wallet: arweave_wallet,
    initState: JSON.stringify(initialState),
    src: contractSrc,
  })
  await arweave.api.get("mine")
  return contractTxId
}

async function initBeforeEach(secure = false) {
  wallet = Wallet.generate()
  wallet2 = Wallet.generate()
  wallet3 = Wallet.generate()
  wallet4 = Wallet.generate()
  arweave_wallet = await arweave.wallets.generate()
  await addFunds(arweave, arweave_wallet)
  walletAddress = await arweave.wallets.jwkToAddress(arweave_wallet)
  const contractTxIdPoseidon1 = await deployContractPoseidon({
    C: Constants.C,
    M: Constants.M,
    P: Constants.P,
  })
  const contractTxIdPoseidon2 = await deployContractPoseidon({
    S: Constants.S,
  })
  const contractTxIdIntmax = await deployContractIntmax(
    contractTxIdPoseidon1,
    contractTxIdPoseidon2
  )
  intmaxSrcTxId = contractTxIdIntmax
  const contractSrc = await deployContract(secure, contractTxIdIntmax)
  return {
    wallet,
    walletAddress,
    wallet,
    wallet2,
    wallet3,
    wallet4,
    arweave_wallet,
    intmaxSrcTxId,
  }
}

module.exports = {
  addFunds,
  init,
  initBeforeEach,
  stop,
}
