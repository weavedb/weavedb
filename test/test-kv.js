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
    db = await init("web", 2, false)
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
    } = await initBeforeEach(false, false, "ar", true, false))
  })

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })

  it("should get version", async () => {
    const version = require("../sdk/contracts/weavedb/lib/version")
    expect(await db.getVersion()).to.equal(version)
  })

  it("should get hash", async () => {
    expect(await db.getHash()).to.equal(null)
    const tx = await db.set({ id: 1 }, "col", "doc")
    expect(await db.getHash()).to.eql(tx.originalTxId)
    const tx2 = await db.set({ id: 2 }, "col", "doc2")

    const hashes = Arweave.utils.concatBuffers([
      Arweave.utils.stringToBuffer(tx.originalTxId),
      Arweave.utils.stringToBuffer(tx2.originalTxId),
    ])
    const hash = await Arweave.crypto.hash(hashes, "SHA-384")
    const new_hash = Arweave.utils.bufferTob64(hash)
    expect(await db.getHash()).to.eql(new_hash)
  })

  it("should get nonce", async () => {
    expect(await db.getNonce(walletAddress)).to.equal(1)
    await db.set({ id: 1 }, "col", "doc")
    expect(await db.getNonce(walletAddress)).to.equal(2)
  })

  it.only("should add & get", async () => {
    const data = { name: "Bob", age: 20 }
    const tx = (await db.add(data, "ppl")).originalTxId
    return
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
    const tx = (await db.update({ death: db.ts() }, "ppl", "Bob")).originalTxId
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

    // where =
    expect(await db.get("ppl", ["age", "==", 30])).to.eql([Alice, Beth])

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
      Alice,
      Beth,
      Bob,
    ])

    // where not-in
    expect(await db.get("ppl", ["age"], ["age", "not-in", [20, 30]])).to.eql([
      John,
    ])

    // where array-contains
    expect(await db.get("ppl", ["letters", "array-contains", "b"])).to.eql([
      Beth,
      Bob,
    ])

    // where array-contains-any
    expect(
      await db.get("ppl", ["letters", "array-contains-any", ["j", "t"]])
    ).to.eql([Beth, John])

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
    await db.addIndex([["age"], ["weight"]], "ppl", {
      ar: arweave_wallet,
    })
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
    await db.setSchema(schema, "ppl", {
      ar: arweave_wallet,
    })
    expect(await db.getSchema("ppl")).to.eql(schema)
    await db.set(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(null)
    await db.setSchema(schema2, "ppl", {
      ar: arweave_wallet,
    })
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
    await db.setRules(rules, "ppl", {
      ar: arweave_wallet,
    })
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
    await db.addIndex([["age"], ["name", "desc"]], "ppl", {
      ar: arweave_wallet,
    })
    await db.addIndex([["age"], ["name", "desc"], ["height"]], "ppl", {
      ar: arweave_wallet,
    })
    await db.addIndex([["age"], ["name", "desc"], ["height", "desc"]], "ppl", {
      ar: arweave_wallet,
    })

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
      [["__id__", "asc"]],
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
    expect(await db.getAddressLink(identity.address.toLowerCase())).to.eql({
      address: addr,
      expiry: 0,
    })
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
    await db.setRules(rules, "ppl", {
      ar: arweave_wallet,
    })
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
      "inc age",
      {
        ar: arweave_wallet,
      }
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(4)
    while (true) {
      await db.mineBlock()
      if ((await db.get("ppl", "Bob")).age > 4) {
        break
      }
    }
    expect((await db.get("ppl", "Bob")).age).to.be.eql(5)
    await db.removeCron("inc age", {
      ar: arweave_wallet,
    })
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
    })
    expect((await db.cget("ppl", "Bob")).setter).to.eql(
      identity.address.toLowerCase()
    )
  })

  it("should add & get with internet identity", async () => {
    const ii = Ed25519KeyIdentity.fromJSON(JSON.stringify(_ii))
    const data = { name: "Bob", age: 20 }
    const tx = (await db.add(data, "ppl", { ii })).originalTxId
    expect((await db.cget("ppl", (await db.getIds(tx))[0])).setter).to.eql(
      ii.toJSON()[0]
    )
  })

  it("should add & get with Arweave wallet", async () => {
    const arweave_wallet = await db.arweave.wallets.generate()
    const data = { name: "Bob", age: 20 }
    const tx = (await db.add(data, "ppl", { ar: arweave_wallet })).originalTxId
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
    })
    expect((await db.cget("ppl", "Bob")).setter).to.eql(
      identity.address.toLowerCase()
    )
  })

  /*
  it("should set algorithms", async () => {
    const provider = new providers.JsonRpcProvider("http://localhost/")
    const intmax_wallet = new Account(provider)
    await intmax_wallet.activate()
    const data = { name: "Bob", age: 20 }
    const tx = (await db.add(data, "ppl", { intmax: intmax_wallet }))
      .originalTxId
    const addr = intmax_wallet._address
    expect((await db.cget("ppl", (await db.getIds(tx))[0])).setter).to.eql(addr)
    await db.setAlgorithms(["secp256k1", "rsa256"], {
      ar: arweave_wallet,
    })
    const data2 = { name: "Alice", age: 25 }
    await db.set(data2, "ppl", "Alice", { intmax: intmax_wallet })
    expect(await db.get("ppl", "Alice")).to.be.eql(null)
    await db.setAlgorithms(["poseidon", "rsa256"], {
      ar: arweave_wallet,
    })
    await db.set(data2, "ppl", "Alice", { intmax: intmax_wallet })
    expect(await db.get("ppl", "Alice")).to.be.eql(data2)
    return
  })
  */
  it("should link and unlink external contracts", async () => {
    expect(await db.getLinkedContract("contractA")).to.eql(null)
    await db.linkContract("contractA", "xyz", {
      ar: arweave_wallet,
    })
    expect(await db.getLinkedContract("contractA")).to.eql("xyz")
    await db.unlinkContract("contractA", "xyz", {
      ar: arweave_wallet,
    })
    expect(await db.getLinkedContract("contractA")).to.eql(null)
    return
  })

  it("should evolve", async () => {
    const data = { name: "Bob", age: 20 }
    const evolve = "contract-1"
    const evolve2 = "contract-2"
    const version = require("../contracts/warp/lib/version")

    const history1 = {
      signer: walletAddress,
      srcTxId: evolve,
      oldVersion: version,
    }
    const history2 = {
      signer: walletAddress,
      srcTxId: evolve2,
      oldVersion: version,
    }

    expect(await db.getEvolve()).to.eql({
      canEvolve: true,
      evolve: null,
      history: [],
      isEvolving: false,
    })

    await db.evolve(evolve, { ar: arweave_wallet })
    await db.migrate(version, { ar: arweave_wallet })
    const evo = await db.getEvolve()
    expect(dissoc("history", evo)).to.eql({
      canEvolve: true,
      evolve,
      isEvolving: false,
    })
    expect(
      compose(map(pick(["signer", "srcTxId", "oldVersion"])))(evo.history)
    ).to.eql([history1])
    await db.setCanEvolve(false, { ar: arweave_wallet })
    const evo2 = await db.getEvolve()
    expect(dissoc("history", evo2)).to.eql({
      canEvolve: false,
      evolve,
      isEvolving: false,
    })
    expect(
      compose(map(pick(["signer", "srcTxId", "oldVersion"])))(evo2.history)
    ).to.eql([history1])

    await db.evolve(evolve2, { ar: arweave_wallet })
    const evo3 = await db.getEvolve()
    expect(dissoc("history", evo3)).to.eql({
      canEvolve: false,
      evolve: evolve,
      isEvolving: false,
    })
    expect(
      compose(map(pick(["signer", "srcTxId", "oldVersion"])))(evo3.history)
    ).to.eql([history1])

    await db.setCanEvolve(true, { ar: arweave_wallet })
    await db.evolve(evolve2, { ar: arweave_wallet })
    await db.set(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(null)
    const evo4 = await db.getEvolve()
    expect(dissoc("history", evo4)).to.eql({
      canEvolve: true,
      evolve: evolve2,
      isEvolving: true,
    })

    await db.migrate(version, { ar: arweave_wallet })
    expect(
      compose(map(pick(["signer", "srcTxId", "oldVersion"])))(evo4.history)
    ).to.eql([history1, history2])

    await db.set(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(data)

    return
  })

  it("should manage owner", async () => {
    const addr = await db.arweave.wallets.jwkToAddress(arweave_wallet)
    const arweave_wallet2 = await db.arweave.wallets.generate()
    let addr2 = await db.arweave.wallets.jwkToAddress(arweave_wallet2)
    expect(await db.getOwner()).to.eql([addr])
    await db.addOwner(addr2, { ar: arweave_wallet })
    expect(await db.getOwner()).to.eql([addr, addr2])
    await db.removeOwner(addr2, { ar: arweave_wallet })
    await db.removeOwner(addr, { ar: arweave_wallet })
    expect(await db.getOwner()).to.eql([])
    return
  })

  it("should relay queries", async () => {
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
    expect(await db.getRelayerJob("test-job")).to.eql(job)
    expect(await db.listRelayerJobs()).to.eql(["test-job"])
    const rules = {
      let: {
        "resource.newData.height": { var: "request.auth.extra.height" },
      },
      "allow write": true,
    }
    await db.setRules(rules, "ppl", {
      ar: arweave_wallet,
    })

    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Bob", age: 20, height: 182 }
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
    const addr = wallet.getAddressString()
    const doc = await db.cget("ppl", "Bob")
    expect(doc.setter).to.equal(addr)
    expect(doc.data).to.eql(data2)
    await db.removeRelayerJob("test-job", { ar: arweave_wallet })
    expect(await db.getRelayerJob("test-job")).to.eql(null)
    return
  })

  it("should relay queries with multisig", async () => {
    const identity = EthCrypto.createIdentity()
    const identity2 = EthCrypto.createIdentity()
    const identity3 = EthCrypto.createIdentity()
    const wallet2 = new Wallet(identity2.privateKey)
    const wallet3 = new Wallet(identity3.privateKey)
    const jobID = "test-job"
    const job = {
      relayers: [identity.address],
      signers: [identity.address, identity2.address, identity3.address],
      multisig: 50,
      multisig_type: "percent",
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
    expect(await db.getRelayerJob("test-job")).to.eql(job)

    const rules = {
      let: {
        "resource.newData.height": { var: "request.auth.extra.height" },
      },
      "allow write": true,
    }
    await db.setRules(rules, "ppl", {
      ar: arweave_wallet,
    })

    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Bob", age: 20, height: 182 }
    const params = await db.sign("set", data, "ppl", "Bob", {
      jobID,
    })
    const extra = { height: 182 }
    const multisig_data = {
      extra,
      jobID,
      params,
    }
    const sig2 = await wallet2.signMessage(JSON.stringify(multisig_data))
    const sig3 = await wallet3.signMessage(JSON.stringify(multisig_data))
    await db.relay("test-job", params, extra, {
      privateKey: identity.privateKey,
      wallet: identity.address,
      multisigs: [sig2, sig3],
    })
    const addr = wallet.getAddressString()
    const doc = await db.cget("ppl", "Bob")
    expect(doc.setter).to.equal(addr)
    expect(doc.data).to.eql(data2)
    await db.removeRelayerJob("test-job", { ar: arweave_wallet })
    expect(await db.getRelayerJob("test-job")).to.eql(null)
    return
  })

  it("should match signers", async () => {
    const original_account = EthWallet.generate()
    const { identity: temp_account } = await db.createTempAddress(
      original_account
    )
    const preset_addr = wallet.getAddressString() // this was set when initializing SDK with EthWallet
    const original_addr = original_account.getAddressString()
    const temp_addr = temp_account.address.toLowerCase()

    // sign with the original_account (default)
    await db.set({ signer: db.signer() }, "signers", "s1", {
      wallet: original_account,
    })
    expect((await db.get("signers", "s1")).signer).to.equal(original_addr)

    // sign with the temp_account linked to the original_account
    await db.set({ signer: db.signer() }, "signers", "s2", {
      wallet: original_addr,
      privateKey: temp_account.privateKey,
    })
    expect((await db.get("signers", "s2")).signer).to.equal(original_addr)

    // sign with the temp_account but as itself
    await db.set({ signer: db.signer() }, "signers", "s3", {
      privateKey: temp_account.privateKey,
    })
    expect((await db.get("signers", "s3")).signer).to.equal(temp_addr)

    // sign with the preset wallet
    await db.set({ signer: db.signer() }, "signers", "s4")
    expect((await db.get("signers", "s4")).signer).to.equal(preset_addr)
  })

  it("should list collections", async () => {
    await db.set({}, "ppl", "Bob")
    await db.set({}, "ppl2", "Bob")
    await db.set({ name: "toyota" }, "ppl", "Bob", "cars", "toyota")
    await db.set({ name: "apple" }, "ppl", "Bob", "foods", "apple")
    expect(await db.listCollections()).to.eql(["ppl", "ppl2"])
    expect(await db.listCollections("ppl", "Bob")).to.eql(["cars", "foods"])
    return
  })

  it("should get info", async () => {
    const addr = await db.arweave.wallets.jwkToAddress(arweave_wallet)
    const version = require("../contracts/warp/lib/version")
    const initial_state = JSON.parse(
      readFileSync(
        resolve(__dirname, "../dist/warp/initial-state.json"),
        "utf8"
      )
    )
    expect(await db.getInfo()).to.eql({
      auth: {
        algorithms: ["secp256k1", "secp256k1-2", "ed25519", "rsa256"],
        name: "weavedb",
        version: "1",
      },
      canEvolve: true,
      contracts: {
        dfinity: dfinityTxId,
        ethereum: ethereumTxId,
      },
      evolve: null,
      isEvolving: false,
      secure: false,
      version,
      owner: addr,
      evolveHistory: [],
    })
    return
  })

  it("should update sub collections", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { weight: 70 }
    await db.set(data, "ppl", "Bob")
    const rules = {
      "allow write": true,
    }
    await db.setRules(rules, "ppl", "Bob", "foods", {
      ar: arweave_wallet,
    })
    await db.set(data2, "ppl", "Bob", "foods", "apple")
    expect(await db.get("ppl", "Bob", "foods", "apple")).to.eql(data2)
  })

  it("should sort without indexes", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", age: 25 }
    const data3 = { name: "John", age: 30 }
    const data4 = { name: "Beth", age: 35 }
    await db.set(data, "ppl", "Bob")
    await db.set(data2, "ppl", "Alice")
    await db.set(data3, "ppl", "John")
    await db.set(data4, "ppl", "Beth")
    const ppl = await db.cget("ppl", 2)
    expect(pluck("data")(ppl)).to.eql([data2, data4])
    const ppl2 = await db.cget("ppl", ["startAfter", ppl[1]], 2)
    expect(pluck("data")(ppl2)).to.eql([data, data3])

    expect(await db.get("ppl", ["__id__", "desc"])).to.eql([
      data3,
      data,
      data4,
      data2,
    ])
  })

  it("should set secure", async () => {
    await db.setSecure(false, { ar: arweave_wallet })
    expect((await db.getInfo()).secure).to.eql(false)
    await db.setSecure(true, { ar: arweave_wallet })
    expect((await db.getInfo()).secure).to.eql(true)
    return
  })

  it("should reject invalid col/doc ids", async () => {
    await db.set({}, "__ppl__", "Bob")
    await db.set({}, "ppl", "Bob/Alice")
    expect(await db.get("ppl")).to.eql([])
    expect(await db.listCollections()).to.eql([])
    return
  })

  it("should insert contract info into access rules", async () => {
    const data = { name: "Bob", age: 20 }
    const rules = {
      let: { "resource.newData.contract": { var: "contract" } },
      "allow write": true,
    }
    const arweave_wallet2 = await db.arweave.wallets.generate()
    let addr2 = await db.arweave.wallets.jwkToAddress(arweave_wallet2)
    await db.addOwner(addr2, { ar: arweave_wallet })
    await db.setRules(rules, "ppl", {
      ar: arweave_wallet,
    })
    await db.set(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(
      mergeLeft(
        {
          contract: {
            id: contractTxId,
            owners: await db.getOwner(),
            version: await db.getVersion(),
          },
        },
        data
      )
    )
  })
  it("should batch execute admin methods", async () => {
    const schema = {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "number",
        },
      },
    }
    const rules = {
      "allow create,update": {
        and: [
          { "!=": [{ var: "request.auth.signer" }, null] },
          { "<": [{ var: "resource.newData.age" }, 30] },
        ],
      },
      "deny delete": { "!=": [{ var: "request.auth.signer" }, null] },
    }
    const algorithms = ["secp256k1", "rsa256"]
    const index = [
      ["age", "desc"],
      ["name", "desc"],
    ]
    const arweave_wallet2 = await db.arweave.wallets.generate()
    const addr = await db.arweave.wallets.jwkToAddress(arweave_wallet)
    const addr2 = await db.arweave.wallets.jwkToAddress(arweave_wallet2)

    const identity = EthCrypto.createIdentity()
    const identity2 = EthCrypto.createIdentity()
    const identity3 = EthCrypto.createIdentity()
    const jobID = "test-job"
    const job = {
      relayers: [identity.address],
      signers: [identity.address, identity2.address, identity3.address],
      multisig: 50,
      multisig_type: "percent",
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
    const cron = {
      span: 2,
      times: 2,
      start: 10000000000,
      do: false,
      jobs: [["add", [{ age: db.inc(1) }, "ppl"]]],
    }

    await db.batch(
      [
        ["addCron", cron, "inc age"],
        ["setSchema", schema, "ppl"],
        ["setRules", rules, "ppl"],
        ["setCanEvolve", false],
        ["setSecure", true],
        ["setAlgorithms", algorithms],
        ["addIndex", index, "ppl"],
        ["addOwner", addr2],
        ["addRelayerJob", jobID, job],
      ],
      {
        ar: arweave_wallet,
      }
    )
    expect(await db.getSchema("ppl")).to.eql(schema)
    expect(await db.getRules("ppl")).to.eql(rules)
    expect((await db.getEvolve()).canEvolve).to.eql(false)
    expect((await db.getInfo()).secure).to.eql(true)
    expect(await db.getAlgorithms()).to.eql(algorithms)
    expect(await db.getIndexes("ppl")).to.eql([index])
    expect(await db.getOwner()).to.eql([addr, addr2])
    expect(await db.getRelayerJob(jobID)).to.eql(job)
    expect((await db.getCrons()).crons).to.eql({ "inc age": cron })
    await db.batch(
      [
        ["removeCron", "inc age"],
        ["removeOwner", addr2],
        ["removeIndex", index, "ppl"],
        ["removeRelayerJob", jobID],
      ],
      {
        ar: arweave_wallet,
      }
    )
    expect((await db.getCrons()).crons).to.eql({})
    expect(await db.getOwner()).to.eql([addr])
    expect(await db.getIndexes("ppl")).to.eql([])
    expect(await db.getRelayerJob(jobID)).to.eql(null)
  })

  it("should only allow owners", async () => {
    const data = { name: "Bob", age: 20 }
    const addr = await db.arweave.wallets.jwkToAddress(arweave_wallet)
    const rules = {
      "allow create": {
        in: [{ var: "request.auth.signer" }, { var: "contract.owners" }],
      },
    }
    await db.setRules(rules, "ppl", {
      ar: arweave_wallet,
    })
    expect(await db.getRules("ppl")).to.eql(rules)
    await db.set(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(null)
    await db.set(data, "ppl", "Bob", { ar: arweave_wallet })
    expect(await db.get("ppl", "Bob")).to.eql(data)
  })
})
