const config = require("../weavedb.config.js")
const DB = require("weavedb-offchain")
const { expect } = require("chai")
const { resolve } = require("path")
const dir = resolve(__dirname, "../db")
const setup = require("../scripts/lib/setup")
const EthCrypto = require("eth-crypto")
const ind = require("../db/indexes")
const settings = require("../scripts/lib/settings")

describe("WeaveDB", () => {
  let db, owner, relayer, user
  beforeEach(async () => {
    owner = EthCrypto.createIdentity()
    relayer = EthCrypto.createIdentity()
    user = EthCrypto.createIdentity()
    db = new DB({ type: 3, state: { owner: owner.address.toLowerCase() } })
    await db.initialize()
    await setup({
      db,
      conf: settings,
      privateKey: owner.privateKey,
    })
  })
  it("should deploy DB contract", async () => {
    expect((await db.getInfo()).auth.name).to.eql("weavedb")
  })
  it("should set schemas", async () => {})
  it("should set indexes", async () => {})
  it("should set rules", async () => {})
  it("should set relayers", async () => {})
  it("should set triggers", async () => {})
  it("should set crons", async () => {})
  it("should execute queries", async () => {
    expect(await db.get("test")).to.eql([])
  })
})
