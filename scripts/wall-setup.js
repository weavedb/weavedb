const EthCrypto = require("eth-crypto")
const { privateToAddress } = require("ethereumjs-util")
require("dotenv").config()
const fs = require("fs")
const path = require("path")
const wallet_name = process.argv[2]
const contractTxId = process.argv[3] || process.env.WALL_CONTRACT_TX_ID
const name = process.env.WALL_APP_NAME || "weavedb"
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
  const db = new SDK({
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

  const addr = `0x${privateToAddress(
    Buffer.from(privateKey.replace(/^0x/, ""), "hex")
  ).toString("hex")}`.toLowerCase()

  console.log("set up WeaveDB..." + contractTxId)

  const schemas_users = {
    type: "object",
    required: ["address", "name"],
    properties: {
      address: {
        type: "string",
      },
      name: {
        type: "string",
      },
    },
  }
  await db.setSchema(schemas_users, "users", { privateKey })
  console.log("users schema set")
  const rules_users = {
    "allow create,update": {
      and: [
        {
          "==": [{ var: "resource.id" }, { var: "request.auth.signer" }],
        },
        {
          "==": [
            { var: "request.auth.signer" },
            { var: "resource.newData.address" },
          ],
        },
        {
          "!=": [{ var: "resource.newData.name" }, ""],
        },
      ],
    },
    "allow delete": {
      and: [
        {
          "==": [{ var: "resource.id" }, { var: "request.auth.signer" }],
        },
      ],
    },
  }
  await db.setRules(rules_users, "users", { privateKey })
  console.log("users rules set")
  const schemas_wall = {
    type: "object",
    required: ["text", "user", "date", "id"],
    properties: {
      id: {
        type: "string",
      },
      text: {
        type: "string",
      },
      name: {
        type: "string",
      },
      date: {
        type: "number",
      },
    },
  }
  await db.setSchema(schemas_wall, "wall", { privateKey })
  console.log("wall schema set")
  const rules_wall = {
    "let create": {
      id: [
        "join",
        ":",
        [{ var: "resource.newData.user" }, { var: "resource.newData.id" }],
      ],
    },
    "allow create": {
      and: [
        {
          "==": [{ var: "resource.id" }, { var: "id" }],
        },
        {
          "==": [
            { var: "request.auth.signer" },
            { var: "resource.newData.user" },
          ],
        },
        {
          "==": [
            { var: "request.block.timestamp" },
            { var: "resource.newData.date" },
          ],
        },
        {
          "!=": [{ var: "resource.newData.text" }, ""],
        },
      ],
    },
    "allow delete": {
      "==": [{ var: "request.auth.signer" }, { var: "resource.data.user" }],
    },
  }
  await db.setRules(rules_wall, "wall", { privateKey })
  console.log("wall rules set")
  process.exit()
}

setup()
