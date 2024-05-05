const { expect } = require("chai")
const { mergeLeft } = require("ramda")
const { spawn } = require("node:child_process")
const { resolve } = require("path")
const { mkdirSync, writeFileSync, rmSync } = require("fs")
const SDK = require("../sdk/light-client-node")
const EthCrypto = require("eth-crypto")
describe("WeaveDB", function () {
  let port = 9089
  let node, db, dir, wallet, wallet2
  this.timeout(0)

  before(done => {
    wallet = EthCrypto.createIdentity()
    wallet2 = EthCrypto.createIdentity()
    dir = resolve(__dirname, ".test-cache")
    const config = resolve(
      __dirname,
      ".test-cache/weavedb.standalone.config.js"
    )
    try {
      rmSync(dir, { recursive: true })
    } catch (e) {}
    mkdirSync(dir)
    writeFileSync(
      config,
      `module.exports = ${JSON.stringify({
        cacheDir: dir,
        dbname: "mydb2",
        secure: false,
        owner: wallet.address.toLowerCase(),
        admin: { privateKey: wallet.privateKey },
      })}`
    )
    node = spawn("node", [
      resolve(__dirname, "../grpc-node/node-server/standalone.js"),
      "--port",
      port,
      "--config",
      config,
    ])
    node.stdout.on("data", data => {
      console.log(data.toString())
      if (/server ready on/.test(data)) done()
    })
    db = new SDK({ rpc: `localhost:${port}`, contractTxId: "offchain" })
  })

  after(async () => {
    node.kill()
    try {
      rmSync(dir, { recursive: true })
    } catch (e) {}
    setTimeout(() => {
      process.exit()
    }, 1000)
  })

  beforeEach(async () => {})

  afterEach(async () => {})

  it("should start node", async () => {
    const jobID = "data"
    expect((await db.getInfo()).secure).to.eql(false)
    const job = {
      relayers: [wallet.address.toLowerCase()],
      schema: {
        type: "object",
        required: ["image"],
        properties: {
          image: {
            type: "string",
          },
        },
      },
    }
    await db.addRelayerJob(jobID, job, { privateKey: wallet.privateKey })
    const sig = await db.sign(
      "set",
      { image: db.data("image") },
      "ppl",
      "Bob",
      {
        privateKey: wallet2.privateKey,
        jobID,
      }
    )
    console.log(sig)
    console.log(
      await db.relay(
        jobID,
        sig,
        { image: "abc" },
        { privateKey: wallet.privateKey }
      )
    )
    console.log(await db.get("ppl"))
    return
  })
})
