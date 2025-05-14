const fs = require("fs")
const path = require("path")

const {
  WarpFactory,
  LoggerFactory,
  defaultCacheOptions,
} = require("warp-contracts")

const { DeployPlugin } = require("warp-contracts-plugin-deploy")
const ArLocal = require("arlocal").default
let Arweave = require("arweave")

async function addFunds(arweave, wallet) {
  const walletAddress = await arweave.wallets.getAddress(wallet)
  await arweave.api.get(`/mint/${walletAddress}/1000000000000000`)
}

describe("Intercall", function () {
  this.timeout(0)
  let warp, arlocal, arweave, wallet
  before(async () => {
    arweave = Arweave.init({
      host: "localhost",
      port: 1820,
      protocol: "http",
    })
    arlocal = new ArLocal(1820, false)
    await arlocal.start()
    wallet = await arweave.wallets.generate()
    await addFunds(arweave, wallet)
    warp = WarpFactory.forLocal(1820)
    LoggerFactory.INST.logLevel("error")
    warp.use(new DeployPlugin())
    const contractSrc = fs.readFileSync(
      path.join(__dirname, "../dist/intercall/contract.js"),
      "utf8"
    )
    const contract = await warp.createContract.deploy({
      wallet,
      initState: JSON.stringify({ count: 0 }),
      src: contractSrc,
    })
    await arweave.api.get("mine")
    const db = warp
      .contract(contract.contractTxId)
      .connect(wallet)
      .setEvaluationOptions({ allowBigInt: true, internalWrites: true })
    const contractSrc2 = fs.readFileSync(
      path.join(__dirname, "../dist/intercall/writer.js"),
      "utf8"
    )
    const contract2 = await warp.createContract.deploy({
      wallet,
      initState: JSON.stringify({ count: 0 }),
      src: contractSrc2,
    })
    await arweave.api.get("mine")
    const db2 = warp
      .contract(contract2.contractTxId)
      .connect(wallet)
      .setEvaluationOptions({ allowBigInt: true, internalWrites: true })
    console.log(contract)
    console.log(
      await db.writeInteraction({
        function: "add",
        num: 3,
        to: contract2.contractTxId,
      })
    )
    console.log("num1", (await db.viewState({ function: "get" })).result)
    console.log("num2", (await db2.viewState({ function: "get" })).result)
  })
  after(async () => await arlocal.stop())
  it("should get version", async () => {})
})
