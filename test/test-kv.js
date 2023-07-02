const { providers, Wallet, utils } = require("ethers")
const { expect } = require("chai")
const { mergeLeft } = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")

const tests = require("./common")
describe("WeaveDB", function () {
  let wallet,
    walletAddress,
    db,
    arweave_wallet,
    contractTxId,
    dfinityTxId,
    ethereumTxId,
    intercallTxId
  const Arweave = require("arweave")

  this.timeout(0)

  before(async () => {
    db = await init("web", 2, false)
  })

  after(async () => await stop())

  beforeEach(async () => {
    ;({
      arweave_wallet,
      walletAddress,
      wallet,
      dfinityTxId,
      ethereumTxId,
      intercallTxId,
      contractTxId,
    } = await initBeforeEach(false, false, "evm", true, false))
  })

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })

  tests(it, () => ({
    db,
    ver: "../sdk/contracts/weavedb-kv/lib/version",
    init: "../dist/weavedb-kv/initial-state.json",
    wallet,
    Arweave,
    arweave_wallet,
    walletAddress,
    dfinityTxId,
    ethereumTxId,
    contractTxId,
  }))

  it("should add triggers", async () => {
    const data1 = {
      key: "trg",
      on: "create",
      func: [
        ["let", "batches", []],
        [
          "do",
          [
            "when",
            ["propEq", "id", "Bob"],
            [
              "pipe",
              ["var", "batches"],
              ["append", ["[]", "update", { age: db.inc(2) }, "ppl", "Bob"]],
              ["let", "batches"],
            ],
            { var: "data" },
          ],
        ],
        ["batch", { var: "batches" }],
      ],
    }
    const data2 = {
      key: "trg2",
      on: "update",
      func: [["upsert", [{ name: "Alice", age: db.inc(1) }, "ppl", "Alice"]]],
    }
    const data3 = {
      key: "trg3",
      on: "delete",
      func: [["update", [{ age: db.inc(1) }, "ppl", "Bob"]]],
    }
    await db.addTrigger(data1, "ppl", { ar: arweave_wallet })
    await db.addTrigger(data2, "ppl", { ar: arweave_wallet })
    await db.addTrigger(mergeLeft({ index: 0 }, data3), "ppl", {
      ar: arweave_wallet,
    })
    expect(await db.getTriggers("ppl")).to.eql([data3, data1, data2])
    await db.set({ name: "Bob", age: 20 }, "ppl", "Bob")
    expect((await db.get("ppl", "Bob")).age).to.eql(22)
    await db.removeTrigger("trg2", "ppl", { ar: arweave_wallet })
    expect(await db.getTriggers("ppl")).to.eql([data3, data1])
  })
})
