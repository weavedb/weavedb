const { initSetup, send, getArgv } = require("./utils")

const argv = getArgv("wallet_name", "contractTxId", "signerAddress")

const setup = async () => {
  const { sdk, wallet, addr } = await initSetup(argv)

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

  const job = {
    relayers: [argv.signerAddress],
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

  await send(sdk, wallet, [
    {
      func: "setSchema",
      query: [schema, "notes"],
      msg: "schema set!",
    },
    {
      func: "addRelayerJob",
      query: ["bundlr", job],
      msg: "relayer job set!",
    },
    { func: "setRules", query: [rules, "notes"], msg: "rules set!" },
  ])

  process.exit()
}

setup()
