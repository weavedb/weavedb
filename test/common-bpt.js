const { expect } = require("chai")
const { parseQuery } = require("../sdk/contracts/weavedb-bpt/lib/utils")
const { readFileSync } = require("fs")
const { resolve } = require("path")
const tests = {
  "should get info": async ({
    db,
    arweave_wallet,
    dfinityTxId,
    ethereumTxId,
    bundlerTxId,
    ver,
    init,
  }) => {
    const addr = await db.arweave.wallets.jwkToAddress(arweave_wallet)
    const version = require(ver)
    const initial_state = JSON.parse(
      readFileSync(resolve(__dirname, init), "utf8")
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
        bundler: bundlerTxId,
      },
      evolve: null,
      isEvolving: false,
      secure: false,
      version,
      owner: addr,
      evolveHistory: [],
    })
    return
  },
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
    expect(await db.get("ppl", ["age"], ["weight"], ["endAt", 30, 60])).to.eql([
      Bob,
      Alice,
    ])

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

    // where array-contains-any
    expect(
      await db.get("ppl", ["letters", "array-contains-any", ["j", "t"]])
    ).to.eql([Beth, John])
  },
  "should update nested object with dot notation": async ({
    db,
    arweave_wallet,
  }) => {
    const data = { age: 30 }
    await db.set(data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(data)
    await db.upsert({ "favorites.food": "apple" }, "ppl", "Bob")
    const data2 = { age: 30, favorites: { food: "apple" } }
    expect(await db.get("ppl", "Bob")).to.eql(data2)
    await db.update(
      {
        "countries.UAE.Dubai": "Marina",
        "favorites.music": "opera",
        "favorites.food": db.del(),
      },
      "ppl",
      "Bob"
    )
    const data3 = {
      age: 30,
      favorites: { music: "opera" },
      countries: { UAE: { Dubai: "Marina" } },
    }
    expect(await db.get("ppl", "Bob")).to.eql(data3)
    await db.addIndex([["countries.UAE.Dubai", "asc"]], "ppl", {
      ar: arweave_wallet,
    })

    expect(await db.get("ppl", ["countries.UAE.Dubai", "==", "Marina"])).to.eql(
      [data3]
    )
  },
  "should parse queries": async ({ db }) => {
    expect(parseQuery(["ppl", ["age", "==", 4]]).queries[0].opt).to.eql({
      limit: 1000,
      startAt: { age: 4 },
      endAt: { age: 4 },
    })
  },
}

module.exports = {
  tests,
}
