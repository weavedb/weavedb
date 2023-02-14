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

  it.only("should receive pubsub notification", done => {
    db.initialize({
      cache_prefix: "local_test",
      wallet: arweave_wallet,
      onUpdate: (state, query, cache) => {
        console.log(cache)
        expect(query.function).to.eql("add")
        done()
      },
    })
    db.add({}, "users", { ar: arweave_wallet })
  })
  const sleep = sec =>
    new Promise(res => {
      setTimeout(() => res(), sec * 1000)
    })
  it("should handle relay queries", async () => {
    let caches = []
    db.initialize({
      cache_prefix: "local_test",
      wallet: arweave_wallet,
      EthWallet: wallet,
      onUpdate: (state, query, cache) => {
        caches.push(cache)
      },
    })
    const identity = EthCrypto.createIdentity()
    const job = {
      relayers: [identity.address],
      schema: {
        type: "object",
        required: ["height"],
        properties: {
          height: {
            type: "number",
          },
        },
      },
    }
    await db.addRelayerJob("test-job", job, {
      ar: arweave_wallet,
    })
    const data = { name: "Bob", age: 20 }
    const param = await db.sign("set", data, "ppl", "Bob", {
      jobID: "test-job",
    })
    await db.relay(
      "test-job",
      param,
      { height: 182 },
      {
        privateKey: identity.privateKey,
        wallet: identity.address,
      }
    )
    await sleep(3)
    console.log(caches[1])
    return
  })

  it("should handle batch queries", async () => {
    let caches = []
    db.initialize({
      cache_prefix: "local_test",
      wallet: arweave_wallet,
      EthWallet: wallet,
      onUpdate: (state, query, cache) => {
        caches.push(cache)
      },
    })
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", age: 40 }
    const data3 = { name: "Beth", age: 10 }
    const tx = (
      await db.batch([
        ["set", data, "ppl", "Bob"],
        ["set", data3, "ppl", "Beth"],
        ["update", { age: 30 }, "ppl", "Bob"],
        ["upsert", { age: 20 }, "ppl", "Bob"],
        ["add", data2, "ppl"],
        ["delete", "ppl", "Beth"],
      ])
    ).originalTxId
    await sleep(3)
    expect(caches[0].keys[0].func).to.equal("set")
    expect(caches[0].keys[1].func).to.equal("set")
    expect(caches[0].keys[2].func).to.equal("update")
    expect(caches[0].keys[3].func).to.equal("upsert")
    expect(caches[0].keys[4].func).to.equal("add")
    expect(caches[0].keys[5].func).to.equal("delete")
    return
  })
})
