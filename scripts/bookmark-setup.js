const EthCrypto = require("eth-crypto")
require("dotenv").config()
const fs = require("fs")
const path = require("path")
const wallet_name = process.argv[2]
const contractTxId = process.argv[3] || process.env.CONTRACT_TX_ID
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

const schemas = {
  bookmarks: {
    type: "object",
    required: ["article_id", "date", "user_address"],
    properties: {
      article_id: {
        type: "string",
      },
      user_address: {
        type: "string",
      },
      date: {
        type: "number",
      },
    },
  },
}

const rules = {
  bookmarks: {
    "allow create": {
      and: [
        { "!=": [{ var: "request.auth.signer" }, null] },
        {
          "==": [
            { var: "resource.id" },
            {
              cat: [
                { var: "resource.newData.article_id" },
                ":",
                { var: "resource.newData.user_address" },
              ],
            },
          ],
        },
        {
          "==": [
            { var: "request.auth.signer" },
            { var: "resource.newData.user_address" },
          ],
        },
        {
          "==": [
            { var: "request.block.timestamp" },
            { var: "resource.newData.date" },
          ],
        },
      ],
    },
    "allow delete": {
      "!=": [
        { var: "request.auth.signer" },
        { var: "resource.newData.user_address" },
      ],
    },
  },
  conf: {
    "allow write": {
      "==": [{ var: "request.auth.signer" }, addr],
    },
  },
  mirror: {
    "allow write": {
      "==": [{ var: "request.auth.signer" }, addr],
    },
  },
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
    name: "asteroid",
    version: "1",
    contractTxId,
    arweave: {
      host:
        wallet_name === "mainnet" ? "arweave.net" : "testnet.redstone.tools",
      port: 443,
      protocol: "https",
      timeout: 200000,
    },
  })

  console.log("init WeaveDB..." + contractTxId)
  const identity = EthCrypto.createIdentity()
  await sdk.setSchema(schemas.bookmarks, "bookmarks", {
    privateKey: identity.privateKey,
  })
  console.log("bookmarks schema set!")

  for (let k in rules) {
    await sdk.setRules(rules[k], k, {
      privateKey: identity.privateKey,
    })
    console.log(`${k} rules set!`)
  }

  process.exit()
}

setup()
