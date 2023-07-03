const { expect } = require("chai")
const DB = require("../sdk/offchain")
const Arweave = require("arweave")
const {} = require("ramda")
const tests = require("./common")
const EthWallet = require("ethereumjs-wallet").default

describe("WeaveDB Offchain", function () {
  let wallet,
    walletAddress,
    db,
    arweave_wallet,
    contractTxId,
    dfinityTxId,
    ethereumTxId,
    arweave

  this.timeout(0)

  before(async () => {
    dfinityTxId = "dfinity"
    ethereumTxId = "ethereum"
    wallet = EthWallet.generate()
    arweave = Arweave.init()
    arweave_wallet = await arweave.wallets.generate()
    walletAddress = await arweave.wallets.jwkToAddress(arweave_wallet)
  })

  beforeEach(async () => {
    contractTxId = "offchain"
    const walletAddress = await arweave.wallets.jwkToAddress(arweave_wallet)
    db = new DB({ state: { secure: false, owner: walletAddress } })
    db.setDefaultWallet(wallet)
  })

  tests(it, () => ({
    type: "offchain",
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
})
