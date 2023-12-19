const fs = require("fs")
const path = require("path")
const Arweave = require("arweave")
const wallet_name = process.argv[2]
const { isNil } = require("ramda")
const Constants = require("../sdk/contracts/intmax/lib/circomlibjs/poseidon_constants_opt.js")
const { WarpFactory, LoggerFactory } = require("warp-contracts")
const { DeployPlugin, ArweaveSigner } = require("warp-contracts-plugin-deploy")

if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}

let warp, walletAddress, arweave, wallet

async function deployContractIntmax(
  contractTxIdPoseidon1,
  contractTxIdPoseidon2,
  contractTxIdPoseidon3,
  contractTxIdPoseidon4,
  contractTxIdPoseidon5,
  contractTxIdPoseidon6,
  contractTxIdPoseidon7,
  contractTxIdPoseidon8
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
  initialState.contracts.poseidonConstants3 = contractTxIdPoseidon3
  initialState.contracts.poseidonConstants4 = contractTxIdPoseidon4
  initialState.contracts.poseidonConstants5 = contractTxIdPoseidon5
  initialState.contracts.poseidonConstants6 = contractTxIdPoseidon6
  initialState.contracts.poseidonConstants7 = contractTxIdPoseidon7
  initialState.contracts.poseidonConstants8 = contractTxIdPoseidon8
  const res = await warp.createContract.deploy({
    wallet: new ArweaveSigner(wallet),
    initState: JSON.stringify(initialState),
    src: contractSrc,
  })
  console.log("deployed Intmax contract")
  console.log(res)
  return res.contractTxId
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
  const res = await warp.createContract.deploy({
    wallet: new ArweaveSigner(wallet),
    initState: JSON.stringify(initialState),
    src: contractSrc,
  })
  console.log("deployed PoseidonConstants contract")
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
  const contractTxIdPoseidon1 = await deployContractPoseidon({
    C: Constants.C,
  })
  const contractTxIdPoseidon2 = await deployContractPoseidon({
    M: Constants.M,
    P: Constants.P,
  })
  const contractTxIdPoseidon3 = await deployContractPoseidon({
    S: Constants.S.slice(0, 6),
  })
  const contractTxIdPoseidon4 = await deployContractPoseidon({
    S: Constants.S.slice(6, 9),
  })
  const contractTxIdPoseidon5 = await deployContractPoseidon({
    S: Constants.S.slice(9, 11),
  })
  const contractTxIdPoseidon6 = await deployContractPoseidon({
    S: Constants.S.slice(11, 13),
  })
  const contractTxIdPoseidon7 = await deployContractPoseidon({
    S: Constants.S.slice(13, 15),
  })
  const contractTxIdPoseidon8 = await deployContractPoseidon({
    S: Constants.S.slice(15),
  })

  const contractTxIdIntmax = await deployContractIntmax(
    contractTxIdPoseidon1,
    contractTxIdPoseidon2,
    contractTxIdPoseidon3,
    contractTxIdPoseidon4,
    contractTxIdPoseidon5,
    contractTxIdPoseidon6,
    contractTxIdPoseidon7,
    contractTxIdPoseidon8
  )
  process.exit()
}

deploy()
