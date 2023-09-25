const { expect } = require("chai")
const DB = require("../sdk/offchain")
const Arweave = require("arweave")
const {} = require("ramda")
const tests = require("./witter")
const EthWallet = require("ethereumjs-wallet").default
const EthCrypto = require("eth-crypto")
const { parseQuery } = require("../sdk/contracts/weavedb-bpt/lib/utils")
const { offchain, notifications } = require("../examples/jots/lib/db_settings")
const setupDB = require("../scripts/setupDB")

describe("WeaveDB Offchain BPT", function () {
  let wallet,
    walletAddress,
    owner,
    relayer,
    db,
    arweave_wallet,
    contractTxId,
    dfinityTxId,
    ethereumTxId,
    bundlerTxId,
    arweave

  this.timeout(0)

  before(async () => {
    dfinityTxId = "dfinity"
    ethereumTxId = "ethereum"
    bundlerTxId = "bundler"
    wallet = EthWallet.generate()
    owner = EthCrypto.createIdentity()
    relayer = EthCrypto.createIdentity()
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
      caller: walletAddress,
    })
    db.setDefaultWallet(wallet)
    await setupDB({
      db: db,
      conf: offchain,
      privateKey: owner.privateKey,
      relayer: relayer.address,
    })
  })

  tests(it, () => ({
    type: "offchain",
    db,
    ver: "../sdk/contracts/weavedb-bpt/lib/version",
    init: "../dist/weavedb-bpt/initial-state.json",
    wallet,
    relayer,
    owner,
    Arweave,
    arweave_wallet,
    walletAddress,
    dfinityTxId,
    ethereumTxId,
    contractTxId,
    bundlerTxId,
  }))
})
