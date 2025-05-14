const DB = require("weavedb-offchain")
const { expect } = require("chai")
const setup = require("../scripts/lib/setup")
const EthCrypto = require("eth-crypto")
const settings = require("../scripts/lib/settings")

describe("WeaveDB", () => {
  let db, owner, relayer, user, ownerAuth, relayerAuth, userAuth
  beforeEach(async () => {
    owner = EthCrypto.createIdentity()
    relayer = EthCrypto.createIdentity()
    user = EthCrypto.createIdentity()
    ownerAuth = { privateKey: owner.privateKey }
    relayerAuth = { privateKey: relayer.privateKey }
    userAuth = { privateKey: user.privateKey }
    db = new DB({ type: 3, state: { owner: owner.address.toLowerCase() } })
    await db.initialize()
    await setup({ db, conf: settings, privateKey: owner.privateKey })
  })
  it("should execute queries", async () => {
    await db.query("set:issue", { symbol: "JOTS" }, "points", "JOTS", ownerAuth)
    await db.query(
      "add:mint",
      { symbol: "JOTS", to: user.address, amount: 100 },
      "events",
      ownerAuth
    )
    await db.query(
      "add:transfer",
      { symbol: "JOTS", to: owner.address, amount: 30 },
      "events",
      userAuth
    )
    console.log(await db.get("points"))
    console.log(await db.get("events"))
    console.log(await db.get("balances"))
  })
})
