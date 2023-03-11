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
  await send(sdk, wallet, [
    {
      func: "addRelayerJob",
      query: ["auth:lens", job],
      msg: "relayer auth:lens job set!",
    },
  ])

  process.exit()
}

setup()
