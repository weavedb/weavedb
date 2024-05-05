const { expect } = require("chai")
const DB = require("../sdk/offchain")
const Arweave = require("arweave")
const {} = require("ramda")
const tests = require("./common")
const EthWallet = require("ethereumjs-wallet").default
const { parseQuery } = require("../sdk/contracts/weavedb-bpt/lib/utils")
const { tests: local } = require("./common-bpt")
describe("WeaveDB Offchain BPT", function () {
  let wallet,
    walletAddress,
    db,
    arweave_wallet,
    contractTxId,
    dfinityTxId,
    ethereumTxId,
    bundlerTxId,
    nostrTxId,
    polygonIDTxId,
    arweave

  this.timeout(0)

  before(async () => {
    dfinityTxId = "dfinity"
    ethereumTxId = "ethereum"
    bundlerTxId = "bundler"
    nostrTxId = "nostr"
    polygonIDTxId = "polygon-id"
    wallet = EthWallet.generate()
    arweave = Arweave.init()
    arweave_wallet = await arweave.wallets.generate()
    walletAddress = await arweave.wallets.jwkToAddress(arweave_wallet)
  })

  beforeEach(async () => {
    contractTxId = "offchain"
    walletAddress = await arweave.wallets.jwkToAddress(arweave_wallet)
    db = new DB({
      state: { nostr: "nostr_events", secure: false, owner: walletAddress },
      type: 3,
      caller: walletAddress,
      _contracts: "../contracts",
    })
    db.setDefaultWallet(wallet)
  })
  tests(
    it,
    () => ({
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
      nostrTxId,
      polygonIDTxId,
    }),
    local,
  )
})
