const SDK = require("../sdk/sdk-web")
const SDKNODE = require("../sdk/sdk-node")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const Wallet = require("ethereumjs-wallet").default
const { isNil } = require("ramda")
const ArLocal = require("arlocal").default
const Constants = require("../sdk/contracts/intmax/lib/circomlibjs/poseidon_constants_opt.js")
const { DeployPlugin } = require("warp-contracts-plugin-deploy")
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
async function init(sdk_type = "web", db_type = 1, useVM2, nocache = true) {
  if (isInit === false) {
    isInit = true
    arlocal = new ArLocal(1820, false)
    await arlocal.start()
  } else {
    clearTimeout(stopto)
  }
  const _SDK = sdk_type === "node" ? SDKNODE : SDK
  sdk = new _SDK({
    network: "localhost",
    nocache,
    type: db_type,
    useVM2,
  })
  arweave = sdk.arweave
  warp = sdk.warp
  warp.use(new DeployPlugin())
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
  type = 1,
}) {
  arweave_wallet ||= await arweave.wallets.generate()
  await addFunds(arweave, arweave_wallet)
  const walletAddress = await arweave.wallets.jwkToAddress(arweave_wallet)

  async function deployContractBPT(
    secure,
    contractTxIdIntmax,
    contractTxIdDfinity,
    contractTxIdEthereum,
    contractTxIdBundler,
    contractTxIdNostr,
    contractTxIdPolygonID
  ) {
    const contractSrc = fs.readFileSync(
      path.join(__dirname, "../dist/weavedb-bpt/contract.js"),
      "utf8"
    )
    const stateFromFile = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../dist/weavedb-bpt/initial-state.json"),
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
    //initialState.contracts.intmax = contractTxIdIntmax
    initialState.contracts.dfinity = contractTxIdDfinity
    initialState.contracts.ethereum = contractTxIdEthereum
    initialState.contracts.bundler = contractTxIdBundler
    initialState.contracts.nostr = contractTxIdNostr
    initialState.contracts.polygonID = contractTxIdPolygonID
    const contract = await warp.createContract.deploy({
      wallet: arweave_wallet,
      initState: JSON.stringify(initialState),
      src: contractSrc,
    })
    await arweave.api.get("mine")
    return contract
  }
  async function deployContractKV(
    secure,
    contractTxIdIntmax,
    contractTxIdDfinity,
    contractTxIdEthereum,
    contractTxIdPolygonID
  ) {
    const contractSrc = fs.readFileSync(
      path.join(__dirname, "../dist/weavedb-kv/contract.js"),
      "utf8"
    )
    const stateFromFile = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../dist/weavedb-kv/initial-state.json"),
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
    //initialState.contracts.intmax = contractTxIdIntmax
    initialState.contracts.dfinity = contractTxIdDfinity
    initialState.contracts.ethereum = contractTxIdEthereum
    //initialState.contracts.polygonID = contractTxIdPolygonID
    const contract = await warp.createContract.deploy({
      wallet: arweave_wallet,
      initState: JSON.stringify(initialState),
      src: contractSrc,
    })
    await arweave.api.get("mine")
    return contract
  }

  async function deployIntercallContract() {
    const contractSrc = fs.readFileSync(
      path.join(__dirname, "../dist/intercall/contract.js"),
      "utf8"
    )
    const stateFromFile = {}
    let initialState = {
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
  async function deployContract(
    secure,
    contractTxIdIntmax,
    contractTxIdDfinity,
    contractTxIdEthereum,
    contractTxIdBundler,
    contractTxIdNostr,
    contractTxIdPolygonID
  ) {
    const contractSrc = fs.readFileSync(
      path.join(__dirname, "../dist/weavedb/contract.js"),
      "utf8"
    )
    const stateFromFile = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../dist/weavedb/initial-state.json"),
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
    //initialState.contracts.intmax = contractTxIdIntmax
    initialState.contracts.dfinity = contractTxIdDfinity
    initialState.contracts.ethereum = contractTxIdEthereum
    initialState.contracts.bundler = contractTxIdBundler
    initialState.contracts.nostr = contractTxIdNostr
    //initialState.contracts.polygonID = contractTxIdPolygonID
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
      path.join(__dirname, "../dist/dfinity/ii.js"),
      "utf8"
    )
    const stateFromFile = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../dist/dfinity/initial-state-ii.json"),
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

  async function deployContractBundler() {
    const contractSrc = fs.readFileSync(
      path.join(__dirname, "../dist/bundler/bundler.js"),
      "utf8"
    )
    const stateFromFile = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../dist/bundler/initial-state-bundler.json"),
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

  async function deployContractNostr() {
    const contractSrc = fs.readFileSync(
      path.join(__dirname, "../dist/nostr/nostr.js"),
      "utf8"
    )
    const stateFromFile = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../dist/nostr/initial-state-nostr.json"),
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
  async function deployContractPolygonID() {
    const contractSrc = fs.readFileSync(
      path.join(__dirname, "../dist/polygon-id/polygon-id.js"),
      "utf8"
    )
    const stateFromFile = JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname,
          "../dist/polygon-id/initial-state-polygon-id.json"
        ),
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
  let intmaxTxId,
    dfinityTxId,
    ethereumTxId,
    bundlerTxId,
    nostrTxId,
    poseidon1TxId,
    poseidon2TxId,
    intercallTxId,
    polygonIDTxId
  if (isNil(contractTxId)) {
    poseidon1TxId = await deployContractPoseidon({
      C: Constants.C,
      M: Constants.M,
      P: Constants.P,
    })
    poseidon2TxId = await deployContractPoseidon({
      S: Constants.S,
    })
    intmaxTxId = await deployContractIntmax(poseidon1TxId, poseidon2TxId)
    dfinityTxId = await deployContractDfinity()
    ethereumTxId = await deployContractEthereum()
    bundlerTxId = await deployContractBundler()
    nostrTxId = await deployContractNostr()
    intercallTxId = await deployIntercallContract()
    polygonIDTxId = await deployContractPolygonID()
    const deployer =
      type === 2
        ? deployContractKV
        : type === 3
        ? deployContractBPT
        : deployContract
    contract = await deployer(
      secure,
      intmaxTxId,
      dfinityTxId,
      ethereumTxId,
      bundlerTxId,
      nostrTxId,
      polygonIDTxId
    )
  } else {
    contract = { contractTxId }
  }

  return {
    contractTxId: contract.contractTxId,
    contract,
    intmaxTxId,
    polygonIDTxId,
    dfinityTxId,
    ethereumTxId,
    bundlerTxId,
    nostrTxId,
    intercallTxId,
    poseidon1TxId,
    poseidon2TxId,
    arweave_wallet,
    walletAddress,
  }
}

async function initBeforeEach(
  secure = false,
  subscribe = false,
  wallet_type = "evm",
  type = 1
) {
  wallet = Wallet.generate()
  wallet2 = Wallet.generate()
  wallet3 = Wallet.generate()
  wallet4 = Wallet.generate()
  const {
    contractTxId,
    contract,
    intmaxTxId,
    polygonIDTxId,
    dfinityTxId,
    ethereumTxId,
    bundlerTxId,
    nostrTxId,
    intercallTxId,
    poseidon1TxId,
    poseidon2TxId,
    arweave_wallet,
    walletAddress,
  } = await deployContracts({
    secure,
    warp,
    arweave,
    type,
  })
  const name = "weavedb"
  const version = "1"
  sdk.initialize({
    contractTxId,
    wallet: arweave_wallet,
    name,
    version,
    EthWallet: wallet,
    subscribe,
  })
  sdk.setDefaultWallet(
    wallet_type === "ar" ? arweave_wallet : wallet,
    wallet_type
  )
  await sdk.mineBlock()

  return {
    wallet,
    walletAddress,
    wallet,
    wallet2,
    wallet3,
    wallet4,
    arweave_wallet,
    intmaxTxId,
    polygonIDTxId,
    dfinityTxId,
    ethereumTxId,
    bundlerTxId,
    nostrTxId,
    intercallTxId,
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
