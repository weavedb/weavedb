const { initSetup, send, getArgv } = require("./utils")
const argv = getArgv(
  "wallet_name",
  "contractTxId",
  "newContractSrcTxId",
  "newVersion"
)

const setup = async () => {
  const { sdk, wallet, addr } = await initSetup(argv)
  await send(sdk, wallet, [
    {
      func: "evolve",
      query: [argv.newContractSrcTxId],
      msg: "evolved!",
    },
    {
      func: "migrate",
      query: [argv.newVersion],
      msg: "migrated!",
    },
  ])
  process.exit()
}

setup()
