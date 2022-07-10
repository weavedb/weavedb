const Arweave = require("arweave")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const { isNil, range } = require("ramda")
const {
  init,
  addFunds,
  mineBlock,
  query,
  get,
  getIds,
  getNonce,
} = require("./util")

const op = {
  ts: () => ({ __op: "ts" }),
  del: () => ({ __op: "del" }),
  inc: n => ({ __op: "inc", n }),
  union: (...args) => ({ __op: "arrayUnion", arr: args }),
  remove: (...args) => ({ __op: "arrayRemove", arr: args }),
}

describe("WeaveDB", function () {
  let arlocal,
    arweave,
    warp,
    wallet,
    walletAddress,
    contractSrc,
    initialState,
    wdb,
    domain,
    wallet2

  this.timeout(0)
  before(async () => {
    ;({
      arlocal,
      arweave,
      warp,
      wallet,
      walletAddress,
      contractSrc,
      initialState,
      wdb,
      domain,
      wallet,
      wallet2,
    } = await init())
  })

  after(async () => {
    await arlocal.stop()
  })

  it("shoud get nonce", async () => {
    expect(await getNonce(wallet.getAddressString())).to.equal(1)
    await query(wallet, "set", [{ id: 1 }, "col", "doc"])
    expect(await getNonce(wallet.getAddressString())).to.equal(2)
  })

  it("shoud add & get", async () => {
    const data = { name: "Bob", age: 20 }
    const tx = await query(wallet, "add", [data, "ppl"])
    expect(await get(["ppl", (await getIds(tx))[0]])).to.eql(data)
  })

  it("shoud set & get", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", height: 160 }
    await query(wallet, "set", [data, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(data)
    await query(wallet, "set", [data2, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(data2)
  })

  it.only("shoud update", async () => {
    const data = { name: "Bob", age: 20 }
    await query(wallet, "set", [data, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(data)
    await query(wallet, "update", [{ age: 25 }, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql({ name: "Bob", age: 25 })
    await query(wallet, "update", [{ age: op.inc(5) }, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql({ name: "Bob", age: 30 })
    await query(wallet, "update", [{ age: op.del(5) }, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql({ name: "Bob" })

    // arrayUnion
    await query(wallet, "update", [
      { foods: op.union("pasta", "cake", "wine") },
      "ppl",
      "Bob",
    ])
    expect(await get(["ppl", "Bob"])).to.eql({
      name: "Bob",
      foods: ["pasta", "cake", "wine"],
    })

    // arrayRemove
    await query(wallet, "update", [
      { foods: op.remove("pasta", "cake") },
      "ppl",
      "Bob",
    ])
    expect(await get(["ppl", "Bob"])).to.eql({
      name: "Bob",
      foods: ["wine"],
    })

    // timestamp
    const tx = await query(wallet, "update", [{ death: op.ts() }, "ppl", "Bob"])
    const tx_data = await arweave.transactions.get(tx)
    const timestamp = (await arweave.blocks.get(tx_data.block)).timestamp
    expect((await get(["ppl", "Bob"])).death).to.be.lte(timestamp)
  })

  it("shoud upsert", async () => {
    const data = { name: "Bob", age: 20 }
    await query(wallet, "upsert", [data, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(data)
  })

  it("shoud delete", async () => {
    const data = { name: "Bob", age: 20 }
    await query(wallet, "set", [data, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(data)
    await query(wallet, "delete", ["ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(null)
  })

  it("shoud get a collection", async () => {
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
    await query(wallet, "set", [Bob, "ppl", "Bob"])
    await query(wallet, "set", [Alice, "ppl", "Alice"])
    await query(wallet, "set", [John, "ppl", "John"])
    await query(wallet, "set", [Beth, "ppl", "Beth"])
    expect(await get(["ppl"])).to.eql([Bob, Alice, John, Beth])

    // limit
    expect((await get(["ppl", 1])).length).to.eql(1)

    // sort
    expect(await get(["ppl", ["height"]])).to.eql([Alice, Beth, Bob, John])

    // sort desc
    expect(await get(["ppl", ["height", "desc"]])).to.eql([
      John,
      Bob,
      Beth,
      Alice,
    ])

    // sort multiple fields
    expect(await get(["ppl", ["age"], ["weight", "desc"]])).to.eql([
      Bob,
      Beth,
      Alice,
      John,
    ])

    // where =
    expect(await get(["ppl", ["age", "=", 30]])).to.eql([Alice, Beth])

    // where >
    expect(await get(["ppl", ["age", ">", 30]])).to.eql([John])

    // where >=
    expect(await get(["ppl", ["age", ">=", 30]])).to.eql([Alice, John, Beth])

    // where <
    expect(await get(["ppl", ["age", "<", 30]])).to.eql([Bob])

    // where <=
    expect(await get(["ppl", ["age", "<=", 30]])).to.eql([Bob, Alice, Beth])

    // where =!
    expect(await get(["ppl", ["age", "!=", 30]])).to.eql([Bob, John])

    // where in
    expect(await get(["ppl", ["age", "in", [20, 30]]])).to.eql([
      Bob,
      Alice,
      Beth,
    ])

    // where not-in
    expect(await get(["ppl", ["age", "not-in", [20, 30]]])).to.eql([John])

    // where array-contains
    expect(await get(["ppl", ["letters", "array-contains", "b"]])).to.eql([
      Bob,
      Beth,
    ])

    // where array-contains-any
    expect(
      await get(["ppl", ["letters", "array-contains-any", ["j", "t"]]])
    ).to.eql([John, Beth])

    // skip startAt
    expect(await get(["ppl", ["age"], ["startAt", 30]])).to.eql([
      Alice,
      Beth,
      John,
    ])

    // skip startAfter
    expect(await get(["ppl", ["age"], ["startAfter", 30]])).to.eql([John])

    // skip endAt
    expect(await get(["ppl", ["age"], ["endAt", 30]])).to.eql([
      Bob,
      Alice,
      Beth,
    ])

    // skip endBefore
    expect(await get(["ppl", ["age"], ["endBefore", 30]])).to.eql([Bob])

    // skip startAt multiple fields
    expect(
      await get(["ppl", ["age"], ["weight"], ["startAt", 30, 70]])
    ).to.eql([Beth, John])

    // skip endAt multiple fields
    expect(await get(["ppl", ["age"], ["weight"], ["endAt", 30, 60]])).to.eql([
      Bob,
      Alice,
    ])
  })

  it("shoud batch execute", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", age: 40 }
    const data3 = { name: "Beth", age: 10 }
    const tx = await query(wallet, "batch", [
      ["set", data, "ppl", "Bob"],
      ["set", data3, "ppl", "Beth"],
      ["update", { age: 30 }, "ppl", "Bob"],
      ["upsert", { age: 20 }, "ppl", "Bob"],
      ["add", data2, "ppl"],
      ["delete", "ppl", "Beth"],
    ])
    expect(await get(["ppl", "Bob"])).to.eql({ name: "Bob", age: 20 })
    expect(await get(["ppl", (await getIds(tx))[0]])).to.eql(data2)
    expect(await get(["ppl", "Beth"])).to.eql(null)
  })
})
