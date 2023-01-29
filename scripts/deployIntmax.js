const fs = require("fs")
const path = require("path")
const Arweave = require("arweave")
const wallet_name = process.argv[2]
const { isNil } = require("ramda")
const Constants = require("../contracts/intmax/lib/circomlibjs/poseidon_constants_opt.js")
const { WarpFactory, LoggerFactory } = require("warp-contracts")

if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}

let warp, walletAddress, arweave, wallet

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
  const res = await warp.createContract.deploy({
    wallet: wallet,
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
    wallet: wallet,
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
  warp = WarpFactory.forMainnet()
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
  process.exit()
}

deploy()
