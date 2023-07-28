const { expect } = require("chai")
const DB = require("../sdk/offchain")
const Arweave = require("arweave")
const {} = require("ramda")
const tests = require("./witter")
const EthWallet = require("ethereumjs-wallet").default
const { parseQuery } = require("../sdk/contracts/weavedb-bpt/lib/utils")
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
      state: { secure: false, owner: walletAddress },
      type: 3,
      caller: walletAddress,
    })
    db.setDefaultWallet(wallet)
  })

  tests(it, () => ({
    type: "offchain",
    db,
    ver: "../sdk/contracts/weavedb-bpt/lib/version",
    init: "../dist/weavedb-bpt/initial-state.json",
    wallet,
    Arweave,
    arweave_wallet,
    walletAddress,
    dfinityTxId,
    ethereumTxId,
    contractTxId,
    bundlerTxId,
  }))
})
