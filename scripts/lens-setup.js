const { initSetup, send, getArgv } = require("./utils")

const argv = getArgv("wallet_name", "network", "contractTxId", "relayerAddress")

const setup = async () => {
  const { sdk, wallet, addr } = await initSetup(argv)

  const job = {
    relayers: [argv.relayerAddress],
    schema: {
      type: "object",
      required: ["linkTo"],
      properties: {
        linkTo: {
          type: "string",
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
