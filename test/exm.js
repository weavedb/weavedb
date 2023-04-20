const {
  TestFunction,
  createWrite,
  FunctionType,
} = require("@execution-machine/sdk")

const { expect } = require("chai")
const { readFileSync } = require("fs")
const { resolve } = require("path")
const Base = require("../sdk/base")
const { all, complement, clone, isNil, keys } = require("ramda")
const Arweave = require("arweave")
const { handle } = require("./exm/reads")

class SDK extends Base {
  constructor({ arweave = {}, src, state, arweave_wallet }) {
    super()
    this.src = src
    this.state = state
    this.arweave_wallet = arweave_wallet
    this.arweave = Arweave.init(arweave)
    this.domain = { name: "weavedb", version: "1", verifyingContract: "exm" }
  }

  async request(func, ...query) {
    return this.viewState({
      function: func,
      query,
    })
  }

  async viewState(opt) {
    const tx = await this._send(opt)
    if (isNil(tx.result) || tx.result.success !== true) {
      throw new Error()
    }
    return tx.result.result
  }

  async getNonce(addr) {
    return (
      (await this.viewState({
        function: "nonce",
        address: addr,
      })) + 1
    )
  }

  async getIds(tx) {
    return this.viewState({
      function: "ids",
      tx: keys(tx.validity)[0],
    })
  }

  async getEvolve() {
    return await this.viewState({
      function: "getEvolve",
    })
  }

  async copy() {
    return await this.viewState({
      function: "copy",
    })
  }

  async evolve(value, opt) {
    return this._write2("evolve", { value }, { ...opt, extra: { value } })
  }
  async setCanEvolve(value, opt) {
    return this._write2("setCanEvolve", { value }, opt)
  }

  async _request(func, param) {
    return await this.send(param)
  }

  async _send(param) {
    return await TestFunction({
      functionSource: this.src,
      functionType: FunctionType.JAVASCRIPT,
      functionInitState: this.state,
      writes: [createWrite(param)],
    })
  }

  async send(param) {
    const tx = await this._send(param)
    if (isNil(tx.result) || tx.result.success !== true) {
      throw new Error()
    }
    this.state = tx.state
    return tx
  }

  async getOwner() {
    return this.request("getOwner")
  }

  async addOwner(address, opt) {
    return this._write2("addOwner", { address }, opt)
  }

  async removeOwner(address, opt) {
    return this._write2("removeOwner", { address }, opt)
  }

  async getVersion() {
    return await this.viewState({
      function: "version",
    })
  }
}

let arweave_wallet, arweave, addr, db

describe("WeaveDB on EXM", function () {
  this.timeout(0)
  before(async () => {
    arweave = Arweave.init()
  })
  beforeEach(async () => {
    arweave_wallet = await arweave.wallets.generate()
    addr = await arweave.wallets.jwkToAddress(arweave_wallet)
    db = new SDK({
      arweave_wallet,
      src: readFileSync(resolve(__dirname, "../dist/exm/exm.js")),
      state: {
        ...JSON.parse(
          readFileSync(resolve(__dirname, "../dist/exm/initial-state.json"))
        ),
        owner: addr,
        secure: false,
      },
    })
  })

  it("should get nonce", async () => {
    expect(await db.getNonce(addr)).to.equal(1)
    await db.set({ id: 1 }, "col", "doc")
    expect(await db.getNonce(addr)).to.equal(2)
  })

  it("should add & get", async () => {
    const data = { name: "Bob", age: 20 }
    const tx = await db.add(data, "ppl")
    const lastId = (await db.getIds(tx))[0]
    expect(await db.get("ppl", lastId)).to.eql(data)
  })

  it("should set & get", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", height: 160 }
    await db.set(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(data)
    await db.set(data2, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(data2)
  })

  it("should cget & pagenate", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", age: 160 }
    await db.set(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(data)
    await db.set(data2, "ppl", "Alice")
    const cursor = (await db.cget("ppl", ["age"], 1))[0]
    expect(await db.get("ppl", ["age"], ["startAfter", cursor])).to.eql([data2])
  })

  it("should update", async () => {
    const data = { name: "Bob", age: 20 }
    await db.set(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(data)
    await db.update({ age: 25 }, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql({ name: "Bob", age: 25 })
    await db.update({ age: db.inc(5) }, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql({ name: "Bob", age: 30 })
    await db.update({ age: db.del(5) }, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql({ name: "Bob" })

    // arrayUnion
    await db.update({ foods: db.union("pasta", "cake", "wine") }, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql({
      name: "Bob",
      foods: ["pasta", "cake", "wine"],
    })

    // arrayRemove
    await db.update({ foods: db.remove("pasta", "cake") }, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql({
      name: "Bob",
      foods: ["wine"],
    })

    // timestamp
    const timestamp = Date.now() / 1000
    const tx = await db.update({ death: db.ts() }, "ppl", "Bob")
    expect((await db.get("ppl", "Bob")).death).to.be.lte(timestamp)
  })

  it("should upsert", async () => {
    const data = { name: "Bob", age: 20 }
    await db.upsert(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(data)
  })

  it("should delete", async () => {
    const data = { name: "Bob", age: 20 }
    await db.set(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(data)
    await db.delete("ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(null)
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
    await db.set(Bob, "ppl", "Bob")
    await db.set(Alice, "ppl", "Alice")
    await db.set(John, "ppl", "John")
    await db.set(Beth, "ppl", "Beth")
    expect(await db.get("ppl")).to.eql([Bob, Alice, John, Beth])

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
    await db.addIndex([["age"], ["weight", "desc"]], "ppl")
    expect(await db.get("ppl", ["age"], ["weight", "desc"])).to.eql([
      Bob,
      Beth,
      Alice,
      John,
    ])

    // where =
    expect(await db.get("ppl", ["age", "=", 30])).to.eql([Alice, Beth])

    // where >
    expect(await db.get("ppl", ["age"], ["age", ">", 30])).to.eql([John])

    // where >=
    expect(await db.get("ppl", ["age"], ["age", ">=", 30])).to.eql([
      Beth,
      Alice,
      John,
    ])

    // where <
    expect(await db.get("ppl", ["age"], ["age", "<", 30])).to.eql([Bob])

    // where <=
    expect(await db.get("ppl", ["age"], ["age", "<=", 30])).to.eql([
      Bob,
      Beth,
      Alice,
    ])

    // where =!
    expect(await db.get("ppl", ["age"], ["age", "!=", 30])).to.eql([Bob, John])

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

    // where array-contains
    expect(await db.get("ppl", ["letters", "array-contains", "b"])).to.eql([
      Bob,
      Beth,
    ])

    // where array-contains-any
    expect(
      await db.get("ppl", ["letters", "array-contains-any", ["j", "t"]])
    ).to.eql([John, Beth])

    // skip startAt
    expect(await db.get("ppl", ["age"], ["startAt", 30])).to.eql([
      Beth,
      Alice,
      John,
    ])

    // skip startAfter
    expect(await db.get("ppl", ["age"], ["startAfter", 30])).to.eql([John])

    // skip endAt
    expect(await db.get("ppl", ["age"], ["endAt", 30])).to.eql([
      Bob,
      Beth,
      Alice,
    ])
    return
    // skip endBefore
    expect(await db.get("ppl", ["age"], ["endBefore", 30])).to.eql([Bob])

    // skip startAt multiple fields
    await db.addIndex([["age"], ["weight"]], "ppl")
    expect(
      await db.get("ppl", ["age"], ["weight"], ["startAt", 30, 70])
    ).to.eql([Beth, John])

    // skip endAt multiple fields
    expect(await db.get("ppl", ["age"], ["weight"], ["endAt", 30, 60])).to.eql([
      Bob,
      Alice,
    ])
  })

  it("should batch execute", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", age: 40 }
    const data3 = { name: "Beth", age: 10 }
    const tx = await db.batch([
      ["set", data, "ppl", "Bob"],
      ["set", data3, "ppl", "Beth"],
      ["update", { age: 30 }, "ppl", "Bob"],
      ["upsert", { age: 20 }, "ppl", "Bob"],
      ["add", data2, "ppl"],
      ["delete", "ppl", "Beth"],
    ])
    expect(await db.get("ppl", "Bob")).to.eql({ name: "Bob", age: 20 })
    expect(await db.get("ppl", (await db.getIds(tx))[0])).to.eql(data2)
    expect(await db.get("ppl", "Beth")).to.eql(null)
  })

  it("should set schema", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", age: 30 }
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
    await db.setSchema(schema, "ppl")
    expect(await db.getSchema("ppl")).to.eql(schema)
    try {
      await db.set(data, "ppl", "Bob")
    } catch (e) {}
    expect(await db.get("ppl", "Bob")).to.eql(null)
    await db.setSchema(schema2, "ppl")
    expect(await db.getSchema("ppl")).to.eql(schema2)
    const tx = await db.set(data2, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(data2)
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
    await db.setRules(rules, "ppl")
    expect(await db.getRules("ppl")).to.eql(rules)
    await db.set(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(data)
    try {
      await db.delete("ppl", "Bob")
    } catch (e) {}
    expect(await db.get("ppl", "Bob")).to.eql(data)
    try {
      await db.update({ age: db.inc(10) }, "ppl", "Bob")
    } catch (e) {}
    expect(await db.get("ppl", "Bob")).to.eql({ name: "Bob", age: 20 })
    await db.update({ age: db.inc(5) }, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql({ name: "Bob", age: 25 })
  })

  it("should add index", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", age: 25 }
    const data3 = { name: "Beth", age: 5 }
    const data4 = { name: "John", age: 20, height: 150 }
    await db.add(data, "ppl")
    expect(await db.get("ppl", ["age"])).to.eql([data])
    await db.set(data2, "ppl", "Alice")
    expect(await db.get("ppl", ["age", "desc"])).to.eql([data2, data])
    await db.upsert(data3, "ppl", "Beth")
    expect(await db.get("ppl", ["age", "desc"])).to.eql([data2, data, data3])
    await db.update({ age: 30 }, "ppl", "Beth")
    expect(await db.get("ppl", ["age", "desc"])).to.eql([
      { name: "Beth", age: 30 },
      data2,
      data,
    ])
    await db.addIndex([["age"], ["name", "desc"]], "ppl")
    await db.addIndex([["age"], ["name", "desc"], ["height"]], "ppl")
    await db.addIndex([["age"], ["name", "desc"], ["height", "desc"]], "ppl")

    await db.upsert(data4, "ppl", "John")
    expect(await db.get("ppl", ["age"], ["name", "desc"])).to.eql([
      data4,
      data,
      data2,
      { name: "Beth", age: 30 },
    ])
    expect(
      await db.get("ppl", ["age"], ["name", "in", ["Alice", "John"]])
    ).to.eql([data4, data2])
    expect(await db.getIndexes("ppl")).to.eql([
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

  it("should pre-process the new data with rules", async () => {
    const rules = {
      let: {
        "resource.newData.age": 30,
      },
      "allow create": true,
    }
    await db.setRules(rules, "ppl")
    await db.upsert({ name: "Bob" }, "ppl", "Bob")
    expect((await db.get("ppl", "Bob")).age).to.eql(30)
  })

  it("should manage owner", async () => {
    const addr = await db.arweave.wallets.jwkToAddress(arweave_wallet)
    const arweave_wallet2 = await db.arweave.wallets.generate()
    let addr2 = await db.arweave.wallets.jwkToAddress(arweave_wallet2)
    expect(await db.getOwner()).to.eql([addr])
    await db.addOwner(addr2)
    expect(await db.getOwner()).to.eql([addr, addr2])
    await db.removeOwner(addr2)
    await db.removeOwner(addr)
    expect(await db.getOwner()).to.eql([])
    return
  })

  it("should get version", async () => {
    expect(await db.getVersion()).to.equal(
      JSON.parse(
        readFileSync(
          resolve(__dirname, "../dist/exm/initial-state.json"),
          "utf8"
        )
      ).version
    )
  })

  it("should evolve", async () => {
    const evolve = "YRdskKzpedSuMCJaORJ-3PR3u4j40e7IpYQGNir0sJ0"
    const evolve2 = "atfnCnfJ0_hKq03XFGow803MPvEVTTZiz9SFyWfbtlY"
    expect((await db.copy()).canEvolve).to.eql(true)
    expect(await db.getEvolve()).to.eql({ canEvolve: true, evolve: null })
    await db.evolve(evolve)
    expect(await db.getEvolve()).to.eql({ canEvolve: true, evolve })
    await db.setCanEvolve(false)
    expect(await db.getEvolve()).to.eql({ canEvolve: false, evolve })
    try {
      await db.evolve(evolve2)
    } catch (e) {}
    expect(await db.getEvolve()).to.eql({ canEvolve: false, evolve: evolve })
    return
  })
})
