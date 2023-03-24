const { initSetup, send, getArgv } = require("./utils")

const argv = getArgv("wallet_name", "network", "contractTxId")

const setup = async () => {
  const { sdk, wallet, addr } = await initSetup(argv)

  const job = {
    "auth:lens": {
      relayers: ["0xF810D4a6F0118E6a6a86A9FBa0dd9EA669e1CC2E".toLowerCase()],
      schema: {
        type: "object",
        required: ["linkTo"],
        properties: {
          linkTo: {
            type: "string",
          },
        },
      },
    },
  }
  const schema_users = {
    type: "object",
    required: ["name", "uid", "handle"],
    properties: {
      name: {
        type: "string",
      },
      uid: {
        type: "string",
      },
      handle: {
        type: "string",
      },
    },
  }
  const schema_posts = {
    type: "object",
    required: ["user", "body", "date", "id"],
    properties: {
      id: {
        type: "string",
      },
      body: {
        type: "string",
      },
      user: {
        type: "string",
      },
      date: {
        type: "number",
      },
    },
  }
  const rules_users = {
    "allow create": {
      and: [
        { "==": [{ var: "resource.newData.uid" }, { var: "request.id" }] },
        {
          "==": [
            { var: "resource.newData.uid" },
            { var: "request.auth.signer" },
          ],
        },
      ],
    },
    "allow update": {
      and: [
        { "==": [{ var: "resource.data.uid" }, { var: "request.id" }] },
        {
          "==": [{ var: "resource.data.uid" }, { var: "request.auth.signer" }],
        },
      ],
    },
    "allow delete": {
      and: [
        {
          "==": [{ var: "request.id" }, { var: "resource.data.uid" }],
        },
      ],
    },
  }
  const rules_posts = {
    "let create": {
      id: [
        "join",
        ":",
        [{ var: "resource.newData.user" }, { var: "resource.newData.id" }],
      ],
    },
    "let delete": {
      id: [
        "join",
        ":",
        [{ var: "resource.data.user" }, { var: "resource.data.id" }],
      ],
    },
    "allow create": {
      and: [
        {
          "==": [
            { var: "resource.newData.user" },
            { var: "request.auth.signer" },
          ],
        },
        {
          "==": [{ var: "id" }, { var: "request.id" }],
        },
      ],
    },
    "allow delete": {
      and: [
        {
          "==": [{ var: "resource.data.user" }, { var: "request.auth.signer" }],
        },
        {
          "==": [{ var: "id" }, { var: "request.id" }],
        },
      ],
    },
  }
  await send(sdk, wallet, [
    {
      func: "batch",
      msg: "lens dapp all set!",
      query: [
        [
          ["addRelayerJob", "auth:lens", job],
          ["setSchema", schema_users, "users"],
          ["setSchema", schema_posts, "posts"],
          ["setRules", rules_users, "users"],
          ["setRules", rules_posts, "posts"],
        ],
      ],
    },
  ])
  process.exit()
}

setup()
