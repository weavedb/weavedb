const { initSetup, send, getArgv } = require("./utils")
const argv = getArgv("wallet_name", "contractTxId")
const setup = async () => {
  const { sdk, wallet, addr } = await initSetup(argv)

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

  await send(sdk, wallet, [
    {
      func: "setSchema",
      query: [schemas_users, "users"],
      msg: "users schema set!",
    },
    {
      func: "setRules",
      query: [rules_users, "users"],
      msg: "users rules set!",
    },
    {
      func: "setSchema",
      query: [schemas_wall, "wall"],
      msg: "wall schema set!",
    },
    { func: "setRules", query: [rules_wall, "wall"], msg: "wall rules set!" },
  ])

  process.exit()
}

setup()
