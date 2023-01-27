const { initSetup, send, getArgv } = require("./utils")

const argv = getArgv("wallet_name", "network", "contractTxId", "signerAddress")

const setup = async () => {
  const { sdk, wallet, addr } = await initSetup(argv)

  const job = {
    signers: [argv.signerAddress],
    multisig_type: "number",
    multisig: 1,
    schema: {
      type: "string",
    },
  }

  await send(sdk, wallet, [
    {
      func: "addRelayerJob",
      query: ["nft-lit-action", job],
      msg: "relayer job set!",
    },
  ])
  process.exit()
}

setup()
