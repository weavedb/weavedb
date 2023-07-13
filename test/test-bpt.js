const { providers, Wallet, utils } = require("ethers")
const { expect } = require("chai")
const { mergeLeft } = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")

const tests = require("./common")
describe("WeaveDB", function () {
  let wallet,
    walletAddress,
    db,
    arweave_wallet,
    contractTxId,
    dfinityTxId,
    ethereumTxId,
    intercallTxId
  const Arweave = require("arweave")

  this.timeout(0)

  before(async () => {
    db = await init("web", 3, false)
  })

  after(async () => await stop())

  beforeEach(async () => {
    ;({
      arweave_wallet,
      walletAddress,
      wallet,
      dfinityTxId,
      ethereumTxId,
      intercallTxId,
      contractTxId,
    } = await initBeforeEach(false, false, "evm", true, false))
  })

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })

  tests(it, () => ({
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
  }))
})
