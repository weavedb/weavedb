const { providers, Wallet, utils } = require("ethers")
const { expect } = require("chai")
const { mergeLeft } = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")
const { tests: local } = require("./common-bpt")
const tests = require("./common")
describe("WeaveDB", function () {
  let wallet,
    walletAddress,
    db,
    arweave_wallet,
    contractTxId,
    dfinityTxId,
    ethereumTxId,
    bundlerTxId,
    intercallTxId,
    nostrTxId,
    polygonIDTxId

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
      bundlerTxId,
      intercallTxId,
      contractTxId,
      nostrTxId,
      polygonIDTxId,
    } = await initBeforeEach(false, false, "evm", 3, false))
  })

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })

  tests(
    it,
    () => ({
      db,
      ver: "../sdk/contracts/weavedb-bpt/lib/version",
      init: "../dist/weavedb-bpt/initial-state.json",
      wallet,
      Arweave,
      arweave_wallet,
      walletAddress,
      dfinityTxId,
      ethereumTxId,
      bundlerTxId,
      contractTxId,
      nostrTxId,
      polygonIDTxId,
    }),
    local,
  )
})
