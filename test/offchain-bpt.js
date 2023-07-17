const { expect } = require("chai")
const DB = require("../sdk/offchain")
const Arweave = require("arweave")
const {} = require("ramda")
const tests = require("./common")
const EthWallet = require("ethereumjs-wallet").default

describe("WeaveDB Offchain BPT", function () {
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
    db = new DB({ state: { secure: false, owner: walletAddress }, type: 3 })
    db.setDefaultWallet(wallet)
  })

  const local = {
    "should get a collection": async ({ db, arweave_wallet }) => {
      const Bob = {
        name: "Bob",
        age: 20,
        height: 170,
        weight: 75,
        letters: ["b", "o"],
      }
      const Alice = {
        name: "Alice",
        age: 30,
        height: 160,
        weight: 60,
        letters: ["a", "l", "i", "c", "e"],
      }
      const John = {
        name: "John",
        age: 40,
        height: 180,
        weight: 100,
        letters: ["j", "o", "h", "n"],
      }
      const Beth = {
        name: "Beth",
        age: 30,
        height: 165,
        weight: 70,
        letters: ["b", "e", "t", "h"],
      }
      await db.set(Bob, "ppl", "Bob")
      await db.set(Alice, "ppl", "Alice")
      await db.set(John, "ppl", "John")
      await db.set(Beth, "ppl", "Beth")
      expect(await db.get("ppl")).to.eql([Alice, Beth, Bob, John])

      // limit
      expect((await db.get("ppl", 1)).length).to.eql(1)

      // sort
      expect(await db.get("ppl", ["height"])).to.eql([Alice, Beth, Bob, John])
      // sort desc
      expect(await db.get("ppl", ["height", "desc"])).to.eql([
        John,
        Bob,
        Beth,
        Alice,
      ])

      // sort multiple fields
      await db.addIndex([["age"], ["weight", "desc"]], "ppl", {
        ar: arweave_wallet,
      })

      expect(await db.get("ppl", ["age"], ["weight", "desc"])).to.eql([
        Bob,
        Beth,
        Alice,
        John,
      ])

      // skip startAt
      expect(await db.get("ppl", ["age"], ["startAt", 30])).to.eql([
        Alice,
        Beth,
        John,
      ])

      // skip startAfter
      expect(await db.get("ppl", ["age"], ["startAfter", 30])).to.eql([John])

      // skip endAt
      expect(await db.get("ppl", ["age"], ["endAt", 30])).to.eql([
        Bob,
        Alice,
        Beth,
      ])

      // skip endBefore
      expect(await db.get("ppl", ["age"], ["endBefore", 30])).to.eql([Bob])

      // skip startAt multiple fields
      await db.addIndex([["age"], ["weight"]], "ppl", {
        ar: arweave_wallet,
      })

      expect(
        await db.get("ppl", ["age"], ["weight"], ["startAt", 30, 70])
      ).to.eql([Beth, John])

      // skip endAt multiple fields
      expect(
        await db.get("ppl", ["age"], ["weight"], ["endAt", 30, 60])
      ).to.eql([Bob, Alice])

      // where =
      expect(await db.get("ppl", ["age", "==", 30])).to.eql([Alice, Beth])

      // where >
      expect(await db.get("ppl", ["age"], ["age", ">", 30])).to.eql([John])

      // where >=
      expect(await db.get("ppl", ["age"], ["age", ">=", 30])).to.eql([
        Alice,
        Beth,
        John,
      ])

      // where <
      expect(await db.get("ppl", ["age"], ["age", "<", 30])).to.eql([Bob])

      // where <=
      expect(await db.get("ppl", ["age"], ["age", "<=", 30])).to.eql([
        Bob,
        Alice,
        Beth,
      ])

      // where array-contains
      expect(await db.get("ppl", ["letters", "array-contains", "b"])).to.eql([
        Beth,
        Bob,
      ])

      // where =!
      expect(await db.get("ppl", ["age"], ["age", "!=", 30])).to.eql([
        Bob,
        John,
      ])

      // where in
      expect(await db.get("ppl", ["age", "in", [20, 30]])).to.eql([
        Bob,
        Alice,
        Beth,
      ])

      // where not-in
      expect(await db.get("ppl", ["age"], ["age", "not-in", [20, 30]])).to.eql([
        John,
      ])

      // where array-contains-any
      expect(
        await db.get("ppl", ["letters", "array-contains-any", ["j", "t"]])
      ).to.eql([Beth, John])
    },
  }

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
    }),
    local
  )
})
