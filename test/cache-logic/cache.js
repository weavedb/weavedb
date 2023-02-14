const SDK = require("../../sdk/sdk-node")
const { Ed25519KeyIdentity } = require("@dfinity/identity")
const { providers, Wallet, utils } = require("ethers")
const { expect } = require("chai")
const {
  isNil,
  range,
  pick,
  pluck,
  dissoc,
  compose,
  map,
  mergeLeft,
} = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("../util")
const buildEddsa = require("circomlibjs").buildEddsa
const Account = require("intmax").Account
const { readFileSync } = require("fs")
const { resolve } = require("path")
const EthCrypto = require("eth-crypto")
const EthWallet = require("ethereumjs-wallet").default
describe("WeaveDB", function () {
  let wallet,
    walletAddress,
    wallet2,
    db,
    arweave_wallet,
    contractTxId,
    dfinityTxId,
    ethereumTxId
  this.timeout(0)

  before(async () => {
    db = await init("node")
  })

  after(async () => await stop())

  beforeEach(async () => {
    ;({
      arweave_wallet,
      walletAddress,
      wallet,
      wallet2,
      dfinityTxId,
      ethereumTxId,
      contractTxId,
    } = await initBeforeEach(null, true))
  })

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })

  it("should receive pubsub notification", done => {
    db.initialize({
      wallet: arweave_wallet,
      onUpdate: (state, query) => {
        expect(query.function).to.eql("add")
        done()
      },
    })
    db.add({}, "users", { ar: arweave_wallet })
  })
})
