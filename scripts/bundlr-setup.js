const EthCrypto = require("eth-crypto")
const fs = require("fs")
const path = require("path")
const wallet_name = process.argv[2]
const network = process.argv[3]
const contractTxId = process.argv[4]
const signerAddress = process.argv[5]

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

  const schema = {
    type: "object",
    required: ["date", "id", "author", "title"],
    properties: {
      title: {
        type: "string",
      },
      date: {
        type: "number",
      },
      id: {
        type: "string",
      },
      author: {
        type: "string",
      },
    },
  }
  await sdk.setSchema(schema, "notes", { ar: wallet })
  console.log("schema set!")

  const job = {
    relayers: [signerAddress],
    schema: {
      type: "object",
      required: ["date", "id", "author"],
      properties: {
        date: {
          type: "number",
        },
        id: {
          type: "string",
        },
        author: {
          type: "string",
        },
      },
    },
  }

  await sdk.addRelayerJob("bundlr", job, {
    ar: wallet,
  })

  console.log("relayer job set!")

  const rules = {
    "let create,update": {
      "resource.newData.author": { var: "request.auth.extra.author" },
      "resource.newData.date": { var: "request.auth.extra.date" },
      "resource.newData.id": { var: "request.auth.extra.id" },
    },
    "allow create": {
      "==": [
        { var: "request.auth.signer" },
        { var: "resource.newData.author" },
      ],
    },
    "allow update,delete": {
      "==": [{ var: "request.auth.signer" }, { var: "resource.data.author" }],
    },
  }
  await sdk.setRules(rules, "notes", {
    ar: wallet,
  })

  console.log("rules set!")
  process.exit()
}

setup()
