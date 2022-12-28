const EthCrypto = require("eth-crypto")
require("dotenv").config()
const fs = require("fs")
const path = require("path")
const wallet_name = process.argv[2]
const network = process.argv[3]
const contractTxId = process.argv[4]
const relayerAddress = process.argv[5]

const { isNil } = require("ramda")
const SDK = require("weavedb-sdk")

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

  const schema = {
    type: "object",
    required: ["owner", "text", "tokenID"],
    properties: {
      owner: {
        type: "string",
      },
      text: {
        type: "string",
      },
      tokenID: {
        type: "number",
      },
    },
  }
  await sdk.setSchema(schema, "nft", { ar: wallet })
  console.log("nft schema set!")

  const job = {
    relayers: [relayerAddress],
    schema: {
      type: "string",
    },
  }

  await sdk.addRelayerJob("nft", job, {
    ar: wallet,
  })

  console.log("relayer job set!")

  const rules = {
    let: {
      owner: ["toLower", { var: "request.auth.extra" }],
      "resource.newData.owner": { var: "owner" },
    },
    "allow write": {
      "==": [{ var: "request.auth.signer" }, { var: "owner" }],
    },
  }
  await sdk.setRules(rules, "nft", {
    ar: wallet,
  })

  console.log("nft rules set!")
  process.exit()
}

setup()
