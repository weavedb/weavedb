const { expect } = require("chai")
const DB = require("../sdk/offchain")
const Arweave = require("arweave")
const {} = require("ramda")
const EthWallet = require("ethereumjs-wallet").default
const { parseQuery } = require("../sdk/contracts/weavedb-bpt/lib/utils")
const EthCrypto = require("eth-crypto")
const setupDB = require("../scripts/setupDB")
const { offchain } = require("../examples/jots/lib/db_settings")

describe("WeaveDB Offchain BPT", function () {
  let wallet,
    walletAddress,
    db,
    arweave_wallet,
    contractTxId,
    dfinityTxId,
    ethereumTxId,
    bundlerTxId,
    arweave
  const owner = EthCrypto.createIdentity()
  const relayer = EthCrypto.createIdentity()
  const acc1 = EthCrypto.createIdentity()
  this.timeout(0)

  before(async () => {
    dfinityTxId = "dfinity"
    ethereumTxId = "ethereum"
    bundlerTxId = "bundler"
    wallet = EthWallet.generate()
    arweave = Arweave.init()
    arweave_wallet = await arweave.wallets.generate()
    walletAddress = await arweave.wallets.jwkToAddress(arweave_wallet)
  })

  beforeEach(async () => {
    contractTxId = "offchain"
    walletAddress = await arweave.wallets.jwkToAddress(arweave_wallet)
    db = new DB({
      state: { secure: true, owner: owner.address.toLowerCase() },
      type: 3,
    })
    await setupDB({
      db,
      conf: offchain,
      privateKey: owner.privateKey.toLowerCase(),
      relayer: relayer.address.toLowerCase(),
    })
  })
  it("should setup service", async () => {
    const bob = { address: acc1.address.toLowerCase() }
    await db.set(
      { address: acc1.address.toLowerCase() },
      "users",
      bob.address,
      {
        privateKey: owner.privateKey,
      }
    )
    expect((await db.get("users", bob.address)).invited_by).to.eql(
      owner.address.toLowerCase()
    )
  })
})
