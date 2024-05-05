const SDK = require("weavedb-node-client")
const Arweave = require("arweave")
const arweave = Arweave.init()
const { expect } = require("chai")
const { spawn } = require("node:child_process")

describe("grpcNode", function () {
  let db, ar, cp
  this.timeout(0)

  before(done => {
    arweave.wallets.generate().then(_ar => {
      ar = _ar
      cp = spawn("node", ["standalone.js"])
      setTimeout(() => done(), 1000)
    })
  })

  beforeEach(async () => {
    db = new SDK({ rpc: "0.0.0.0:9090", contractTxId: "offchain" })
  })

  after(async () => cp.kill())

  it("should run gRPC server", async () => {
    await db.get("ppl")
    const Bob = { name: "Bob" }
    const Alice = { name: "Alice" }
    await db.add(Bob, "ppl", { ar })
    await db.add(Alice, "ppl", { ar })
    expect(await db.get("ppl")).to.eql([Bob, Alice])
  })
})
