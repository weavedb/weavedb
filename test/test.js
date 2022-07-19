const Arweave = require("arweave")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const { isNil, range } = require("ramda")
const {
  init,
  initBeforeEach,
  addFunds,
  mineBlock,
  query,
  get,
  cget,
  getSchema,
  getRules,
  getIds,
  getNonce,
  getIndexes,
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
    ;({ arlocal, arweave, warp } = await init())
  })

  after(async () => {
    await arlocal.stop()
  })

  beforeEach(async () => {
    ;({
      wallet,
      walletAddress,
      contractSrc,
      initialState,
      wdb,
      domain,
      wallet,
      wallet2,
    } = await initBeforeEach())
  })

  it("should get nonce", async () => {
    expect(await getNonce(wallet.getAddressString())).to.equal(1)
    await query(wallet, "set", [{ id: 1 }, "col", "doc"])
    expect(await getNonce(wallet.getAddressString())).to.equal(2)
  })

  it("should add & get", async () => {
    const data = { name: "Bob", age: 20 }
    const tx = await query(wallet, "add", [data, "ppl"])
    expect(await get(["ppl", (await getIds(tx))[0]])).to.eql(data)
  })

  it("should set & get", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", height: 160 }
    await query(wallet, "set", [data, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(data)
    await query(wallet, "set", [data2, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(data2)
  })

  it("should cget & pagenate", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", age: 160 }
    await query(wallet, "set", [data, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(data)
    await query(wallet, "set", [data2, "ppl", "Alice"])
    const cursor = (await cget(["ppl", ["age"], 1]))[0]
    expect(await get(["ppl", ["age"], ["startAfter", cursor]])).to.eql([data2])
  })

  it("should update", async () => {
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

  it("should upsert", async () => {
    const data = { name: "Bob", age: 20 }
    await query(wallet, "upsert", [data, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(data)
  })

  it("should delete", async () => {
    const data = { name: "Bob", age: 20 }
    await query(wallet, "set", [data, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(data)
    await query(wallet, "delete", ["ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(null)
  })

  it("should get a collection", async () => {
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
    await query(wallet, "addIndex", [[["age"], ["weight", "desc"]], "ppl"])
    expect(await get(["ppl", ["age"], ["weight", "desc"]])).to.eql([
      Bob,
      Beth,
      Alice,
      John,
    ])
    // where =
    expect(await get(["ppl", ["age", "=", 30]])).to.eql([Alice, Beth])

    // where >
    expect(await get(["ppl", ["age"], ["age", ">", 30]])).to.eql([John])

    // where >=
    expect(await get(["ppl", ["age"], ["age", ">=", 30]])).to.eql([
      Beth,
      Alice,
      John,
    ])

    // where <
    expect(await get(["ppl", ["age"], ["age", "<", 30]])).to.eql([Bob])

    // where <=
    expect(await get(["ppl", ["age"], ["age", "<=", 30]])).to.eql([
      Bob,
      Beth,
      Alice,
    ])

    // where =!
    expect(await get(["ppl", ["age"], ["age", "!=", 30]])).to.eql([Bob, John])

    // where in
    expect(await get(["ppl", ["age", "in", [20, 30]]])).to.eql([
      Bob,
      Alice,
      Beth,
    ])
    // where not-in
    expect(await get(["ppl", ["age"], ["age", "not-in", [20, 30]]])).to.eql([
      John,
    ])

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
      Beth,
      Alice,
      John,
    ])

    // skip startAfter
    expect(await get(["ppl", ["age"], ["startAfter", 30]])).to.eql([John])

    // skip endAt
    expect(await get(["ppl", ["age"], ["endAt", 30]])).to.eql([
      Bob,
      Beth,
      Alice,
    ])

    // skip endBefore
    expect(await get(["ppl", ["age"], ["endBefore", 30]])).to.eql([Bob])

    // skip startAt multiple fields
    await query(wallet, "addIndex", [[["age"], ["weight"]], "ppl"])
    expect(
      await get(["ppl", ["age"], ["weight"], ["startAt", 30, 70]])
    ).to.eql([Beth, John])

    // skip endAt multiple fields
    expect(await get(["ppl", ["age"], ["weight"], ["endAt", 30, 60]])).to.eql([
      Bob,
      Alice,
    ])
  })

  it("should batch execute", async () => {
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

  it("should set schema", async () => {
    const data = { name: "Bob", age: 20 }
    const schema = {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "number",
        },
      },
    }
    const schema2 = {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
        },
      },
    }
    await query(wallet, "setSchema", [schema, "ppl"])
    expect(await getSchema(["ppl"])).to.eql(schema)
    await query(wallet, "set", [data, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(null)
    await query(wallet, "setSchema", [schema2, "ppl"])
    expect(await getSchema(["ppl"])).to.eql(schema2)
    await query(wallet, "set", [data, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(data)
  })

  it("should set rules", async () => {
    const data = { name: "Bob", age: 20 }
    const rules = {
      "allow create,update": {
        and: [
          { "!=": [{ var: "request.auth.signer" }, null] },
          { "<": [{ var: "resource.newData.age" }, 30] },
        ],
      },
      "deny delete": { "!=": [{ var: "request.auth.signer" }, null] },
    }
    await query(wallet, "setRules", [rules, "ppl"])
    expect(await getRules(["ppl"])).to.eql(rules)
    await query(wallet, "set", [data, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(data)
    await query(wallet, "delete", ["ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql(data)
    await query(wallet, "update", [{ age: op.inc(10) }, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql({ name: "Bob", age: 20 })
    await query(wallet, "update", [{ age: op.inc(5) }, "ppl", "Bob"])
    expect(await get(["ppl", "Bob"])).to.eql({ name: "Bob", age: 25 })
  })

  it.only("should add index", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", age: 25 }
    const data3 = { name: "Beth", age: 5 }
    const data4 = { name: "John", age: 20, height: 150 }
    await query(wallet, "add", [data, "ppl"])
    expect(await get(["ppl", ["age"]])).to.eql([data])
    await query(wallet, "set", [data2, "ppl", "Alice"])
    expect(await get(["ppl", ["age", "desc"]])).to.eql([data2, data])
    await query(wallet, "upsert", [data3, "ppl", "Beth"])
    expect(await get(["ppl", ["age", "desc"]])).to.eql([data2, data, data3])
    await query(wallet, "update", [{ age: 30 }, "ppl", "Beth"])
    expect(await get(["ppl", ["age", "desc"]])).to.eql([
      { name: "Beth", age: 30 },
      data2,
      data,
    ])
    await query(wallet, "addIndex", [[["age"], ["name", "desc"]], "ppl"])
    await query(wallet, "addIndex", [
      [["age"], ["name", "desc"], ["height"]],
      "ppl",
    ])
    await query(wallet, "addIndex", [
      [["age"], ["name", "desc"], ["height", "desc"]],
      "ppl",
    ])

    await query(wallet, "upsert", [data4, "ppl", "John"])
    expect(await get(["ppl", ["age"], ["name", "desc"]])).to.eql([
      data4,
      data,
      data2,
      { name: "Beth", age: 30 },
    ])
    expect(
      await get(["ppl", ["age"], ["name", "in", ["Alice", "John"]]])
    ).to.eql([data4, data2])
    expect(await getIndexes(["ppl"])).to.eql([
      [["name", "asc"]],
      [["age", "asc"]],
      [
        ["age", "asc"],
        ["name", "desc"],
      ],
      [
        ["age", "asc"],
        ["name", "desc"],
        ["height", "asc"],
      ],
      [
        ["age", "asc"],
        ["name", "desc"],
        ["height", "desc"],
      ],
      [["height", "asc"]],
    ])
  })
})
