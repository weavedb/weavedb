const EthCrypto = require("eth-crypto")
const { privateToAddress } = require("ethereumjs-util")
require("dotenv").config()
const fs = require("fs")
const path = require("path")
const wallet_name = process.argv[2]
const contractTxId = process.argv[3] || process.env.CONTRACT_TX_ID
const name = process.env.NAME || "weavedb"
const version = process.env.VERSION || "1"
let privateKey = process.env.PRIVATE_KEY
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
    name,
    version,
    contractTxId,
    arweave: {
      host:
        wallet_name === "mainnet" ? "arweave.net" : "testnet.redstone.tools",
      port: 443,
      protocol: "https",
      timeout: 200000,
    },
  })

  console.log("set up WeaveDB..." + contractTxId)
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
  if (isNil(privateKey)) {
    const identity = EthCrypto.createIdentity()
    privateKey = identity.privateKey
  }
  const addr = `0x${privateToAddress(
    Buffer.from(privateKey.replace(/^0x/, ""), "hex")
  ).toString("hex")}`.toLowerCase()

  await sdk.setSchema(schemas.bookmarks, "bookmarks", {
    privateKey,
  })
  console.log("bookmarks schema set!")

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
        in: [{ var: "request.auth.signer" }, [addr, true]],
      },
    },
    mirror: {
      "allow write": {
        in: [{ var: "request.auth.signer" }, [addr, true]],
      },
    },
  }

  for (let k in rules) {
    await sdk.setRules(rules[k], k, {
      privateKey,
    })
    console.log(`${k} rules set!`)
  }

  process.exit()
}

setup()
