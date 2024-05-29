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
    db = new DB({
      type: 3,
      local: true,
      state: { owner: owner.address.toLowerCase() },
    })
    await db.initialize()
    await setup({ db, conf: settings, privateKey: owner.privateKey })
  })
  it("should execute queries", async () => {})
})
