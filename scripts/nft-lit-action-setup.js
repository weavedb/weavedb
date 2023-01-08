const EthCrypto = require("eth-crypto")
const fs = require("fs")
const path = require("path")
const wallet_name = process.argv[2]
const network = process.argv[3]
const contractTxId = process.argv[4]
const relayerAddresses = process.argv[5]
const lit_ipfsId = process.argv[6]

const { isNil } = require("ramda")
const SDK = require("../sdk")

if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}

if (isNil(contractTxId)) {
  console.log("contract not specified")
  process.exit()
}

const setup = async () => {
  const wallet_path = path.resolve(
    __dirname,
    ".wallets",
    `wallet-${wallet_name}.json`
  )
  if (!fs.existsSync(wallet_path)) {
    console.log("wallet doesn't exist")
    process.exit()
  }
  const wallet = JSON.parse(fs.readFileSync(wallet_path, "utf8"))
  const sdk = new SDK({
    wallet,
    contractTxId,
    network,
  })

  console.log("init WeaveDB..." + contractTxId)

  const job = {
    relayers: relayerAddresses.split(","),
    multisig: 3,
    lit_ipfsId,
    schema: {
      type: "string",
    },
  }

  await sdk.addRelayerJob("nft-lit-action", job, {
    ar: wallet,
  })

  console.log("relayer job set!")

  process.exit()
}

setup()
