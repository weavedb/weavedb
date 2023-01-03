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
    required: ["tokenIDs", "date", "lit", "owner"],
    properties: {
      owner: {
        type: "string",
      },
      tokenIDs: {
        type: "array",
        items: {
          type: "number",
        },
      },
      lit: {
        encryptedData: { type: "string" },
        encryptedSymmetricKey: { type: "array", items: { type: "number" } },
        evmContractConditions: { type: "object" },
      },
      date: {
        type: "number",
      },
    },
  }
  await sdk.setSchema(schema, "lit_message", { ar: wallet })
  console.log("lit_message schema set!")
  const job = {
    relayers: [relayerAddress],
    schema: {
      type: "object",
      required: ["tokenIDs", "lit", "isOwner"],
      properties: {
        tokenIDs: {
          type: "array",
          items: {
            type: "number",
          },
        },
        lit: {
          encryptedData: { type: "string" },
          encryptedSymmetricKey: { type: "array", items: { type: "number" } },
          evmContractConditions: { type: "object" },
        },
        isOwner: {
          type: "boolean",
        },
      },
    },
  }

  await sdk.addRelayerJob("lit", job, {
    ar: wallet,
  })

  console.log("relayer lit job set!")

  const rules = {
    let: {
      "resource.newData.tokenIDs": { var: "request.auth.extra.tokenIDs" },
      "resource.newData.lit": { var: "request.auth.extra.lit" },
      "resource.newData.owner": { var: "request.auth.signer" },
    },
    "allow create": {
      and: [
        { "==": [{ var: "request.auth.extra.isOwner" }, true] },
        {
          "==": [
            { var: "request.block.timestamp" },
            { var: "resource.newData.date" },
          ],
        },
      ],
    },
  }

  await sdk.setRules(rules, "lit_message", {
    ar: wallet,
  })

  console.log("lit_message rules set!")
  process.exit()
}

setup()
