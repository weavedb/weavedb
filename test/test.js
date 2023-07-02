const { WarpFactory, LoggerFactory } = require("warp-contracts")
LoggerFactory.INST.logLevel("error")

const { expect } = require("chai")
const {} = require("ramda")
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
    db = await init("web", 1, false)
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
    } = await initBeforeEach())
  })

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })

  tests(it, () => ({
    db,
    ver: "../sdk/contracts/weavedb/lib/version",
    init: "../dist/weavedb/initial-state.json",
    wallet,
    Arweave,
    arweave_wallet,
    walletAddress,
    dfinityTxId,
    ethereumTxId,
    contractTxId,
  }))

  it("should accept inter-contract write", async () => {
    const rules = {
      "let create": {
        "resource.newData.caller": { var: "request.caller" },
      },
      "allow create": true,
    }
    await db.setRules(rules, "ppl", {
      ar: arweave_wallet,
    })

    const data = { name: "Bob", age: 20 }
    const params = await db.sign("set", data, "ppl", "Bob")

    const warp = WarpFactory.forLocal(1820)
    const ic = warp
      .contract(intercallTxId)
      .connect(arweave_wallet)
      .setEvaluationOptions({ internalWrites: true, allowBigInt: true })
    await ic.writeInteraction({ function: "write", to: contractTxId, params })
    await ic.readState()
    expect(await db.get("ppl", "Bob")).to.eql({
      name: "Bob",
      age: 20,
      caller: intercallTxId,
    })
  })

  it("should accept inter-contract write with relay", async () => {
    const jobID = "test-job"
    const job = {
      relayers: [intercallTxId],
      internalWrites: true,
    }

    await db.addRelayerJob("test-job", job, {
      ar: arweave_wallet,
    })
    const rules = {
      "let create": {
        "resource.newData.height": { var: "request.auth.extra.height" },
      },
      "allow create": true,
    }
    await db.setRules(rules, "ppl", {
      ar: arweave_wallet,
    })

    const data = { name: "Bob", age: 20 }

    const params = await db.sign("set", data, "ppl", "Bob", { jobID })
    const warp = WarpFactory.forLocal(1820)
    const ic = warp
      .contract(intercallTxId)
      .connect(arweave_wallet)
      .setEvaluationOptions({ internalWrites: true, allowBigInt: true })
    await ic.writeInteraction({ function: "relay", to: contractTxId, params })
    await ic.readState()
    expect(await db.get("ppl", "Bob")).to.eql({
      name: "Bob",
      age: 20,
      height: 180,
    })
  })
})
