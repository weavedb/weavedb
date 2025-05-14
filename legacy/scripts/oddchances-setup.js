const { initSetup, send, getArgv } = require("./utils")
const argv = getArgv("wallet_name", "contractTxId")

const schema_game_results = {
  type: "object",
  required: ["is_even", "user_address", "date", "last_guess_date", "has_won"],
  properties: {
    is_even: {
      type: "boolean",
    },
    user_address: {
      type: "string",
    },
    date: {
      type: "number",
    },
    last_guess_date: {
      type: "number",
    },
    has_won: {
      type: "boolean",
    },
  },
}

const rules_game_results = {
  "let create": {
    "resource.newData.has_won": [
      "equals",
      ["equals", ["modulo", { var: "resource.newData.date" }, 2], 0],
      { var: "resource.newData.is_even" },
    ],
  },

  "allow create": {
    and: [
      {
        "!=": [
          { var: "request.block.timestamp" },
          { var: "resource.newData.last_guess_date" },
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
}

const setup = async () => {
  const { sdk, wallet, addr } = await initSetup(argv)

  await send(sdk, wallet, [
    {
      func: "setSchema",
      query: [schema_game_results, "game_results"],
      msg: "game_results schema set!",
    },
    {
      func: "setRules",
      query: [rules_game_results, "game_results"],
      msg: "game_results rules set!",
    },
  ])
  process.exit()
}

setup()
