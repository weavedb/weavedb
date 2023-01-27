const { initSetup, send, getArgv } = require("./utils")
const argv = getArgv("wallet_name", "contractTxId")

const schemas = {
  type: "object",
  required: ["task", "date", "user_address", "done"],
  properties: {
    task: {
      type: "string",
    },
    user_address: {
      type: "string",
    },
    date: {
      type: "number",
    },
    done: {
      type: "boolean",
    },
  },
}

const rules = {
  "allow create": {
    and: [
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
      {
        "==": [{ var: "resource.newData.done" }, false],
      },
    ],
  },
  "allow update": {
    and: [
      {
        "==": [
          { var: "request.auth.signer" },
          { var: "resource.newData.user_address" },
        ],
      },
      {
        "==": [{ var: "resource.newData.done" }, true],
      },
    ],
  },
  "allow delete": {
    "==": [
      { var: "request.auth.signer" },
      { var: "resource.data.user_address" },
    ],
  },
}

const setup = async () => {
  const { sdk, wallet, addr } = await initSetup(argv)

  await send(sdk, wallet, [
    {
      func: "setSchema",
      query: [schemas, "tasks"],
      msg: "tasks schema set!",
    },
    { func: "setRules", query: [rules, "tasks"], msg: "tasks rules set!" },
  ])
  process.exit()
}

setup()
