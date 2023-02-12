const Arweave = require("arweave")
const { isNil } = require("ramda")
const SDK = require("../../sdk/sdk-node")
const Client = require("../../sdk/light-client-node")
const { LoggerFactory, WarpFactory } = require("warp-contracts")
const { WarpSubscriptionPlugin } = require("warp-contracts-plugin-subscription")
const {
  contractTxId = "4vmZsX1lQaqtNCgzglddd6LZs6m8pNdfKbOKxCkriR8",
  rpc = "localhost:9090",
} = require("yargs")(process.argv.slice(2)).argv
const { expect } = require("chai")
if (isNil(contractTxId)) {
  throw new Error("contractTxId is not specified")
}
let db, client, contract, ar, docID, updated, data

class CustomSubscriptionPlugin extends WarpSubscriptionPlugin {
  async process(input) {
    updated = true
    expect(await client.get("test", docID)).to.eql(data)
  }
}
const warp = WarpFactory.forMainnet()
LoggerFactory.INST.logLevel("error")
warp.use(new CustomSubscriptionPlugin(contractTxId, warp))

describe("Warp pub/sub plugin", function () {
  this.timeout(0)

  before(async () => {
    const arweave = Arweave.init()
    ar = await arweave.wallets.generate()
    db = new SDK({ contractTxId })
    await db.initializeWithoutWallet()
    expect((await db.getInfo()).secure).to.eql(false)

    // bare contract init
    contract = warp.contract(contractTxId).setEvaluationOptions({
      allowBigInt: true,
      useVM2: true,
    })
    expect(
      (await contract.viewState({ function: "getInfo" })).result.secure
    ).to.eql(false)

    // light-client init
    client = new Client({ contractTxId, rpc })
    expect((await client.getInfo()).secure).to.eql(false)
    updated = false
    docID = null
    data = { rand: Math.random() }
  })
  const sleep = ms => new Promise(res => setTimeout(() => res(true), ms))

  it("should manage node", async () => {
    // add data
    let tx = await client.add(data, "test", { ar })
    docID = tx.docID
    expect(tx.success).to.eql(true)

    // immediately get cache from node
    expect(await client.get("test", tx.docID)).to.eql(null)

    // immediately get with nocache from node
    expect(await client.get("test", tx.docID, true)).to.eql(data)
    await sleep(5000)

    // check if sdk cache has been updated by pubsub
    expect(updated).to.eql(true)
    expect(await db.getCache("test", tx.docID)).to.eql(data)

    // check if the node cache is updated by pubsub
    expect(await client.get("test", tx.docID)).to.eql(data)
    return
  })
})
