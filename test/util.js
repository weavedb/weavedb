const SDK = require("../sdk")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const Wallet = require("ethereumjs-wallet").default

const { isNil } = require("ramda")
const ArLocal = require("arlocal").default
const Constants = require("../src/intmax/lib/circomlibjs/poseidon_constants_opt.js")

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

async function deployContracts({
  secure,
  warp,
  arweave,
  contractTxId,
  arweave_wallet,
}) {
  arweave_wallet ||= await arweave.wallets.generate()
  await addFunds(arweave, arweave_wallet)
  const walletAddress = await arweave.wallets.jwkToAddress(arweave_wallet)
  async function deployContract(
    secure,
    contractTxIdIntmax,
    contractTxIdDfinity,
    contractTxIdEthereum
  ) {
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
    let initialState = {
      ...stateFromFile,
      ...{
        secure,
        owner: walletAddress,
      },
    }
    initialState.contracts.intmax = contractTxIdIntmax
    initialState.contracts.dfinity = contractTxIdDfinity
    initialState.contracts.ethereum = contractTxIdEthereum
    const contract = await warp.createContract.deploy({
      wallet: arweave_wallet,
      initState: JSON.stringify(initialState),
      src: contractSrc,
    })
    await arweave.api.get("mine")
    return contract
  }

  async function deployContractDfinity() {
    const contractSrc = fs.readFileSync(
      path.join(__dirname, "../dist/internet-identity/ii.js"),
      "utf8"
    )
    const stateFromFile = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../dist/internet-identity/initial-state-ii.json"),
        "utf8"
      )
    )
    const initialState = {
      ...stateFromFile,
      ...{
        owner: walletAddress,
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

  async function deployContractEthereum() {
    const contractSrc = fs.readFileSync(
      path.join(__dirname, "../dist/ethereum/eth.js"),
      "utf8"
    )
    const stateFromFile = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../dist/ethereum/initial-state-eth.json"),
        "utf8"
      )
    )
    const initialState = {
      ...stateFromFile,
      ...{
        owner: walletAddress,
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

  async function deployContractIntmax(
    contractTxIdPoseidon1,
    contractTxIdPoseidon2
  ) {
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
      path.join(__dirname, "../dist/poseidon/poseidonConstants.js"),
      "utf8"
    )
    const stateFromFile = JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname,
          "../dist/poseidon/initial-state-poseidon-constants.json"
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
  let contract = {}
  let intmaxSrcTxId,
    dfinitySrcTxId,
    ethereumSrcTxId,
    poseidon1TxId,
    poseidon2TxId
  if (isNil(contractTxId)) {
    poseidon1TxId = await deployContractPoseidon({
      C: Constants.C,
      M: Constants.M,
      P: Constants.P,
    })
    poseidon2TxId = await deployContractPoseidon({
      S: Constants.S,
    })
    intmaxSrcTxId = await deployContractIntmax(poseidon1TxId, poseidon2TxId)
    dfinitySrcTxId = await deployContractDfinity()
    ethereumSrcTxId = await deployContractEthereum()
    contract = await deployContract(
      secure,
      intmaxSrcTxId,
      dfinitySrcTxId,
      ethereumSrcTxId
    )
  } else {
    contract = { contractTxId }
  }

  return {
    contractTxId: contract.contractTxId,
    contract,
    intmaxSrcTxId,
    dfinitySrcTxId,
    ethereumSrcTxId,
    poseidon1TxId,
    poseidon2TxId,
    arweave_wallet,
    walletAddress,
  }
}
async function initBeforeEach(secure = false) {
  wallet = Wallet.generate()
  wallet2 = Wallet.generate()
  wallet3 = Wallet.generate()
  wallet4 = Wallet.generate()
  const {
    contractTxId,
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
    wallet,
    wallet2,
    wallet3,
    wallet4,
    arweave_wallet,
    intmaxSrcTxId,
    dfinitySrcTxId,
    ethereumSrcTxId,
    contractTxId,
  }
}

module.exports = {
  addFunds,
  init,
  initBeforeEach,
  stop,
  deployContracts,
}
