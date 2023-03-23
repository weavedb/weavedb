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
const { init, stop, initBeforeEach, addFunds } = require("./util")
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
  const Arweave = require("arweave")
  const _ii = [
    "302a300506032b6570032100ccd1d1f725fc35a681d8ef5d563a3c347829bf3f0fe822b4a4b004ee0224fc0d",
    "010925abb4cf8ccb7accbcfcbf0a6adf1bbdca12644694bb47afc7182a4ade66ccd1d1f725fc35a681d8ef5d563a3c347829bf3f0fe822b4a4b004ee0224fc0d",
  ]

  this.timeout(0)

  before(async () => {
    db = await init("web", 1, false, false)
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
    } = await initBeforeEach())
  })

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })
  it.only("should bundle mulitple transactions", async () => {
    const arweave_wallet2 = await db.arweave.wallets.generate()
    const arweave_wallet3 = await db.arweave.wallets.generate()
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", age: 30 }
    const data3 = { name: "Beth", age: 40 }
    const tx = await db.set(data, "ppl", "Bob")
    const tx2 = await db.set(data2, "ppl", "Alice")
    const tx3 = await db.set(data3, "ppl", "Beth")
    await tx.getResult()
    await tx2.getResult()
    await tx3.getResult()
    expect(await db.get("ppl", "Bob")).to.eql(data)
    expect(await db.get("ppl", "Alice")).to.eql(data2)
    expect(await db.get("ppl", "Beth")).to.eql(data3)
  })
})
