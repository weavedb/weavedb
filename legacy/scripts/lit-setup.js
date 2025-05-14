const { initSetup, send, getArgv } = require("./utils")

const argv = getArgv("wallet_name", "network", "contractTxId", "relayerAddress")

const setup = async () => {
  const { sdk, wallet, addr } = await initSetup(argv)

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

  const job = {
    relayers: [argv.relayerAddress],
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

  await send(sdk, wallet, [
    {
      func: "setSchema",
      query: [schema, "lit_messages"],
      msg: "lit_message schema set!",
    },
    {
      func: "addRelayerJob",
      query: ["lit", job],
      msg: "relayer lit job set!",
    },
    {
      func: "setRules",
      query: [rules, "lit_messages"],
      msg: "lit_message rules set!",
    },
  ])

  process.exit()
}

setup()
