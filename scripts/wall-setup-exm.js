const EthCrypto = require("eth-crypto")
const { privateToAddress } = require("ethereumjs-util")
require("dotenv").config()
const fs = require("fs")
const path = require("path")
const wallet_name = process.argv[2]
const functionId = process.argv[3]
const token = process.argv[4]
const { values, isNil } = require("ramda")
const SDK = require("../sdk-exm")

if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}

if (isNil(functionId)) {
  console.log("functionId not specified")
  process.exit()
}

if (isNil(token)) {
  console.log("token not specified")
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
    arweave_wallet: wallet,
    functionId,
    token,
  })

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
  if (
    values(
      (await db.setSchema(schemas_users, "users")).data.execution.validity
    )[0] !== true
  ) {
    console.log("something went wrong")
    process.exit()
  }
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
  if (
    values(
      (await db.setRules(rules_users, "users")).data.execution.validity
    )[0] !== true
  ) {
    console.log("something went wrong")
    process.exit()
  }
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
  if (
    values(
      (await db.setSchema(schemas_wall, "wall")).data.execution.validity
    )[0] !== true
  ) {
    console.log("something went wrong")
    process.exit()
  }
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
          "!=": [{ var: "resource.newData.text" }, ""],
        },
      ],
    },
    "allow delete": {
      "==": [{ var: "request.auth.signer" }, { var: "resource.data.user" }],
    },
  }
  if (
    values(
      (await db.setRules(rules_wall, "wall")).data.execution.validity
    )[0] !== true
  ) {
    console.log("something went wrong")
    process.exit()
  }
  console.log("wall rules set")
  process.exit()
}

setup()
