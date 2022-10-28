const { Signature, RSAKey, KEYUTIL } = require("jsrsasign")
const Scalar = require("ffjavascript").Scalar
const crypto = require("crypto")
const { Ed25519KeyIdentity } = require("@dfinity/identity")
const { providers, Wallet, utils } = require("ethers")
const Arweave = require("arweave")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const { isNil, range, pick } = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")
const { Buffer } = require("buffer")
const buildEddsa = require("circomlibjs").buildEddsa
const Account = require("intmax").Account
const shajs = require("sha.js")

describe("WeaveDB", function () {
  let wallet, walletAddress, wallet2, db, intmaxSrcTxId, arweave_wallet
  const _ii = [
    "302a300506032b6570032100ccd1d1f725fc35a681d8ef5d563a3c347829bf3f0fe822b4a4b004ee0224fc0d",
    "010925abb4cf8ccb7accbcfcbf0a6adf1bbdca12644694bb47afc7182a4ade66ccd1d1f725fc35a681d8ef5d563a3c347829bf3f0fe822b4a4b004ee0224fc0d",
  ]

  this.timeout(0)

  before(async () => {
    db = await init()
  })

  after(async () => await stop())

  beforeEach(async () => {
    ;({
      arweave_wallet,
      intmaxSrcTxId,
      walletAddress,
      wallet,
      wallet2,
    } = await initBeforeEach())
  })

  it("should get nonce", async () => {
    expect(await db.getNonce(wallet.getAddressString())).to.equal(1)
    await db.set({ id: 1 }, "col", "doc")
    expect(await db.getNonce(wallet.getAddressString())).to.equal(2)
  })

  it("should add & get", async () => {
    const data = { name: "Bob", age: 20 }
    const tx = await db.add(data, "ppl")
    expect(await db.get("ppl", (await db.getIds(tx))[0])).to.eql(data)
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
    const tx = await db.update({ death: db.ts() }, "ppl", "Bob")
    const tx_data = await db.arweave.transactions.get(tx)
    const timestamp = (await db.arweave.blocks.get(tx_data.block)).timestamp
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
    await db.set(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(null)
    await db.setSchema(schema2, "ppl")
    expect(await db.getSchema("ppl")).to.eql(schema2)
    await db.set(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(data)
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
    await db.delete("ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(data)
    await db.update({ age: db.inc(10) }, "ppl", "Bob")
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

  it("should link temporarily generated address", async () => {
    const addr = wallet.getAddressString()
    const { identity } = await db.createTempAddress(addr)
    delete db.wallet
    await db.set({ name: "Beth", age: 10 }, "ppl", "Beth", {
      wallet: addr,
      privateKey: identity.privateKey,
    })
    expect((await db.cget("ppl", "Beth")).setter).to.eql(addr)
    await db.removeAddressLink(
      {
        address: identity.address,
      },
      { wallet }
    )
    await db.set({ name: "Bob", age: 20 }, "ppl", "Bob", {
      privateKey: identity.privateKey,
      overwrite: true,
    })
    expect((await db.cget("ppl", "Bob")).setter).to.eql(
      identity.address.toLowerCase()
    )
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
    await db.upsert({ name: "Bob" }, "ppl", "Bob")
  })

  it("should execute crons", async () => {
    await db.set({ age: 3 }, "ppl", "Bob")
    await db.addCron(
      {
        span: 2,
        times: 2,
        do: true,
        jobs: [["upsert", [{ age: db.inc(1) }, "ppl", "Bob"]]],
      },
      "inc age"
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(4)
    while (true) {
      await db.mineBlock()
      if ((await db.get("ppl", "Bob")).age > 4) {
        break
      }
    }
    expect((await db.get("ppl", "Bob")).age).to.be.eql(5)
    await db.removeCron("inc age")
    expect((await db.getCrons()).crons).to.eql({})
  })

  it("should link temporarily generated address with internet identity", async () => {
    const ii = Ed25519KeyIdentity.fromJSON(JSON.stringify(_ii))
    const addr = ii.toJSON()[0]
    const { identity } = await db.createTempAddressWithII(ii)
    await db.set({ name: "Beth", age: 10 }, "ppl", "Beth", {
      wallet: addr,
      privateKey: identity.privateKey,
    })
    expect((await db.cget("ppl", "Beth")).setter).to.eql(addr)
    await db.removeAddressLink(
      {
        address: identity.address,
      },
      { ii }
    )
    await db.set({ name: "Bob", age: 20 }, "ppl", "Bob", {
      privateKey: identity.privateKey,
      overwrite: true,
    })
    expect((await db.cget("ppl", "Bob")).setter).to.eql(
      identity.address.toLowerCase()
    )
  })

  it("should add & get with internet identity", async () => {
    const ii = Ed25519KeyIdentity.fromJSON(JSON.stringify(_ii))
    const data = { name: "Bob", age: 20 }
    const tx = await db.add(data, "ppl", { ii })
    expect((await db.cget("ppl", (await db.getIds(tx))[0])).setter).to.eql(
      ii.toJSON()[0]
    )
  })

  it("should add & get with Arweave wallet", async () => {
    const arweave_wallet = await db.arweave.wallets.generate()
    const data = { name: "Bob", age: 20 }
    const tx = await db.add(data, "ppl", { ar: arweave_wallet })
    const addr = await db.arweave.wallets.jwkToAddress(arweave_wallet)
    expect((await db.cget("ppl", (await db.getIds(tx))[0])).setter).to.eql(addr)
    return
  })

  it("should link temporarily generated address with Arweave wallet", async () => {
    const arweave_wallet = await db.arweave.wallets.generate()
    let addr = await db.arweave.wallets.jwkToAddress(arweave_wallet)
    const { identity } = await db.createTempAddressWithAR(arweave_wallet)
    await db.set({ name: "Beth", age: 10 }, "ppl", "Beth", {
      wallet: addr,
      privateKey: identity.privateKey,
    })
    expect((await db.cget("ppl", "Beth")).setter).to.eql(addr)
    await db.removeAddressLink(
      {
        address: identity.address,
      },
      { ar: arweave_wallet }
    )
    await db.set({ name: "Bob", age: 20 }, "ppl", "Bob", {
      privateKey: identity.privateKey,
      overwrite: true,
    })
    expect((await db.cget("ppl", "Bob")).setter).to.eql(
      identity.address.toLowerCase()
    )
  })

  function toArrayBuffer(buf) {
    const ab = new ArrayBuffer(buf.length)
    const view = new Uint8Array(ab)
    for (let i = 0; i < buf.length; ++i) {
      view[i] = buf[i]
    }
    return ab
  }

  it("should add & get with Intmax wallet", async () => {
    const provider = new providers.JsonRpcProvider("http://localhost/")
    const intmax_wallet = new Account(provider)
    await intmax_wallet.activate()
    const data = { name: "Bob", age: 20 }
    const tx = await db.add(data, "ppl", { intmax: intmax_wallet })
    const addr = intmax_wallet._address
    expect((await db.cget("ppl", (await db.getIds(tx))[0])).setter).to.eql(addr)
    return
  })

  it("should add & get with Intmax wallet with an EVM account", async () => {
    const intmax_wallet = Wallet.createRandom()
    intmax_wallet._account = { address: intmax_wallet.address }
    const data = { name: "Bob", age: 20 }
    const tx = await db.add(data, "ppl", { intmax: intmax_wallet })
    const addr = intmax_wallet.address
    expect((await db.cget("ppl", (await db.getIds(tx))[0])).setter).to.eql(
      addr.toLowerCase()
    )
    return
  })

  it("should link temporarily generated address with Intmax wallet with EVM account", async () => {
    const intmax_wallet = Wallet.createRandom()
    intmax_wallet._account = { address: intmax_wallet.address }
    const addr = intmax_wallet._address
    const { identity } = await db.createTempAddressWithIntmax(intmax_wallet)
    return
    await db.set({ name: "Beth", age: 10 }, "ppl", "Beth", {
      wallet: addr,
      privateKey: identity.privateKey,
    })
    expect((await db.cget("ppl", "Beth")).setter).to.eql(addr)
    await db.removeAddressLink(
      {
        address: identity.address,
      },
      { intmax: intmax_wallet }
    )
    await db.set({ name: "Bob", age: 20 }, "ppl", "Bob", {
      privateKey: identity.privateKey,
      overwrite: true,
    })
    expect((await db.cget("ppl", "Bob")).setter).to.eql(
      identity.address.toLowerCase()
    )
  })

  it("should link temporarily generated address with Intmax wallet", async () => {
    const provider = new providers.JsonRpcProvider("http://localhost/")
    const intmax_wallet = new Account(provider)
    await intmax_wallet.activate()
    const addr = intmax_wallet._address
    const { identity } = await db.createTempAddressWithIntmax(intmax_wallet)
    await db.set({ name: "Beth", age: 10 }, "ppl", "Beth", {
      wallet: addr,
      privateKey: identity.privateKey,
    })
    expect((await db.cget("ppl", "Beth")).setter).to.eql(addr)
    await db.removeAddressLink(
      {
        address: identity.address,
      },
      { intmax: intmax_wallet }
    )
    await db.set({ name: "Bob", age: 20 }, "ppl", "Bob", {
      privateKey: identity.privateKey,
      overwrite: true,
    })
    expect((await db.cget("ppl", "Bob")).setter).to.eql(
      identity.address.toLowerCase()
    )
  })

  it("should set algorithms", async () => {
    const provider = new providers.JsonRpcProvider("http://localhost/")
    const intmax_wallet = new Account(provider)
    await intmax_wallet.activate()
    const data = { name: "Bob", age: 20 }
    const tx = await db.add(data, "ppl", { intmax: intmax_wallet })
    const addr = intmax_wallet._address
    expect((await db.cget("ppl", (await db.getIds(tx))[0])).setter).to.eql(addr)
    await db.setAlgorithms(["secp256k1"])
    const data2 = { name: "Alice", age: 25 }
    await db.set(data2, "ppl", "Alice", { intmax: intmax_wallet })
    expect(await db.get("ppl", "Alice")).to.be.eql(null)
    await db.setAlgorithms(["poseidon"])
    await db.set(data2, "ppl", "Alice", { intmax: intmax_wallet })
    expect(await db.get("ppl", "Alice")).to.be.eql(data2)
    return
  })

  it("should link and unlink external contracts", async () => {
    expect(await db.getLinkedContract("contractA")).to.eql(null)
    await db.linkContract("contractA", "xyz")
    expect(await db.getLinkedContract("contractA")).to.eql("xyz")
    await db.unlinkContract("contractA", "xyz")
    expect(await db.getLinkedContract("contractA")).to.eql(null)
    return
  })

  it("should validate Intmax signature", async () => {
    const provider = new providers.JsonRpcProvider("http://localhost/")
    const intmax_wallet = new Account(provider)
    await intmax_wallet.activate()
    const intmax = db.warp.pst(intmaxSrcTxId).connect(arweave_wallet)
    const data = { test: 1 }
    const signature = await intmax_wallet.sign(JSON.stringify(data))
    const _publicKey = intmax_wallet._publicKey
    const eddsa = await buildEddsa()
    const packedPublicKey = eddsa.babyJub.packPoint(_publicKey)
    const pubKey = "0x" + Buffer.from(packedPublicKey).toString("hex")
    expect(
      (
        await intmax.viewState({
          function: "verify",
          data,
          signature,
          pubKey,
        })
      ).result.isValid
    ).to.eql(true)
    return
  })
})
