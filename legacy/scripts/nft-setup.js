const { initSetup, send, getArgv } = require("./utils")

const argv = getArgv("wallet_name", "network", "contractTxId", "relayerAddress")

const setup = async () => {
  const { sdk, wallet, addr } = await initSetup(argv)

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

  const job = {
    relayers: [argv.relayerAddress],
    schema: {
      type: "string",
    },
  }

  const rules = {
    let: {
      owner: ["toLower", { var: "request.auth.extra" }],
      "resource.newData.owner": { var: "owner" },
    },
    "allow write": {
      "==": [{ var: "request.auth.signer" }, { var: "owner" }],
    },
  }

  await send(sdk, wallet, [
    {
      func: "setSchema",
      query: [schema, "nft"],
      msg: "nft schema set!",
    },
    {
      func: "addRelayerJob",
      query: ["nft", job],
      msg: "relayer job set!",
    },
    {
      func: "setRules",
      query: [rules, "nft"],
      msg: "nft rules set!",
    },
  ])

  process.exit()
}

setup()
