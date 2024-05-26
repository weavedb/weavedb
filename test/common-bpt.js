const DB = require("../sdk/offchain")
const { Wallet } = require("ethers")
const {
  AuthV2PubSignals,
  PROTOCOL_CONSTANTS,
  CircuitId,
  CredentialStatusType,
  core,
} = require("@0xpolygonid/js-sdk")
const rhsUrl = "https://rhs-staging.polygonid.me"
const {
  initInMemoryDataStorageAndWallets,
  initCircuitStorage,
  initProofService,
  initPackageManager,
} = require("./walletSetup")

const { expect } = require("chai")
const { parseQuery } = require("../sdk/contracts/weavedb-bpt/lib/utils")
const { readFileSync } = require("fs")
const { resolve } = require("path")
const { range, mergeLeft, pluck, map, last } = require("ramda")
const EthCrypto = require("eth-crypto")
let arweave = require("arweave")
const {
  getSignature,
  getEventHash,
  generatePrivateKey,
  getPublicKey,
  finishEvent,
} = require("nostr-tools")

const sleep = ms =>
  new Promise(res => {
    setTimeout(() => {
      res()
    }, ms)
  })

const getId = async (contractTxId, input, timestamp) => {
  const str = JSON.stringify({
    contractTxId,
    input,
    timestamp,
  })

  return arweave.utils.bufferTob64Url(
    await arweave.crypto.hash(arweave.utils.stringToBuffer(str)),
  )
}
const getHash = async ids => {
  return arweave.utils.bufferTob64(
    await arweave.crypto.hash(
      arweave.utils.concatBuffers(
        map(v2 => arweave.utils.stringToBuffer(v2))(ids),
      ),
      "SHA-384",
    ),
  )
}

const getNewHash = async (last_hash, current_hash) => {
  const hashes = arweave.utils.concatBuffers([
    arweave.utils.stringToBuffer(last_hash),
    arweave.utils.stringToBuffer(current_hash),
  ])
  return arweave.utils.bufferTob64(await arweave.crypto.hash(hashes, "SHA-384"))
}

const tests = {
  "should get info": async ({
    db,
    arweave_wallet,
    dfinityTxId,
    ethereumTxId,
    bundlerTxId,
    nostrTxId,
    polygonIDTxId,
    ver,
    init,
  }) => {
    const addr = await db.arweave.wallets.jwkToAddress(arweave_wallet)
    const version = require(ver)
    const initial_state = JSON.parse(
      readFileSync(resolve(__dirname, init), "utf8"),
    )
    expect(await db.getInfo()).to.eql({
      auth: {
        algorithms: ["secp256k1", "secp256k1-2", "ed25519", "rsa256"],
        name: "weavedb",
        version: "1",
      },
      bundlers: [],
      canEvolve: true,
      contracts: {
        dfinity: dfinityTxId,
        ethereum: ethereumTxId,
        bundler: bundlerTxId,
        nostr: nostrTxId,
        polygonID: polygonIDTxId,
      },
      evolve: null,
      isEvolving: false,
      secure: false,
      version,
      owner: addr,
      rollup: { height: 0, hash: db.contractTxId },
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
      await db.get("ppl", ["age"], ["weight"], ["startAt", 30, 70]),
    ).to.eql([Beth, John])

    // skip endAt multiple fields
    expect(await db.get("ppl", ["age"], ["weight"], ["endAt", 30, 60])).to.eql([
      Bob,
      Alice,
    ])

    // where ==
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

    // where in with sort
    expect(await db.get("ppl", ["weight"], ["age", "in", [20, 30]])).to.eql([
      Alice,
      Beth,
      Bob,
    ])

    // where not-in with sort
    expect(
      await db.get("ppl", ["age"], ["weight", "desc"], ["age", "not-in", [30]]),
    ).to.eql([Bob, John])
    // where != with sort
    expect(
      await db.get("ppl", ["age"], ["weight", "desc"], ["age", "!=", 30]),
    ).to.eql([Bob, John])

    // where array-contains-any
    expect(
      await db.get("ppl", ["letters", "array-contains-any", ["j", "t"]]),
    ).to.eql([Beth, John])

    // where array-contains-any with sort

    await db.addIndex(
      [["letters", "array"], ["age", "desc"], ["weight"]],
      "ppl",
      {
        ar: arweave_wallet,
      },
    )
    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["weight", "asc"],
        ["letters", "array-contains-any", ["j", "t", "a"]],
      ),
    ).to.eql([John, Alice, Beth])

    // where == with sort
    expect(await db.get("ppl", ["weight", "desc"], ["age", "==", 30])).to.eql([
      Beth,
      Alice,
    ])

    // where multiple == with sort
    await db.addIndex([["age"], ["height"], ["weight", "desc"]], "ppl", {
      ar: arweave_wallet,
    })
    expect(
      await db.get(
        "ppl",
        ["weight", "desc"],
        ["age", "==", 30],
        ["height", "==", 160],
      ),
    ).to.eql([Alice])
    expect(
      await db.get(
        "ppl",
        ["height"],
        ["weight", "desc"],
        ["age", "==", 30],
        ["height", "==", 160],
      ),
    ).to.eql([Alice])

    await db.addIndex([["age"], ["height"], ["weight", "desc"]], "ppl", {
      ar: arweave_wallet,
    })
    expect(
      await db.get(
        "ppl",
        ["age"],
        ["height"],
        ["age", "==", 30],
        ["height", "!=", 160],
        ["weight", "desc"],
      ),
    ).to.eql([Beth])

    // array-contains with limit
    expect(await db.get("ppl", ["letters", "array-contains", "b"], 1)).to.eql([
      Beth,
    ])

    const alice = await db.cget("ppl", "Alice")
    const bob = await db.cget("ppl", "Bob")
    const beth = await db.cget("ppl", "Beth")
    const john = await db.cget("ppl", "John")
    // cursor
    expect(await db.get("ppl", ["age"], ["startAfter", alice])).to.eql([
      Beth,
      John,
    ])

    expect(await db.get("ppl", ["age", ">", 20], ["startAfter", alice])).to.eql(
      [Beth, John],
    )

    expect(
      await db.get("ppl", ["age", ">=", 20], ["startAfter", alice]),
    ).to.eql([Beth, John])

    expect(await db.get("ppl", ["age", ">", 30], ["startAt", alice])).to.eql([
      John,
    ])

    expect(await db.get("ppl", ["age"], ["endBefore", alice])).to.eql([Bob])

    expect(await db.get("ppl", ["age", "<=", 29], ["endBefore", beth])).to.eql([
      Bob,
    ])

    expect(await db.get("ppl", ["age", ">=", 20], ["endBefore", beth])).to.eql([
      Bob,
      Alice,
    ])

    expect(await db.get("ppl", ["age", ">=", 20], ["endAt", alice])).to.eql([
      Bob,
      Alice,
    ])

    // array-contains with cursor
    await db.addIndex([["letters", "array"], ["name"]], "ppl", {
      ar: arweave_wallet,
    })

    expect(
      await db.get(
        "ppl",
        ["name", ">", "Beth"],
        ["letters", "array-contains", "b"],
        ["startAfter", beth],
      ),
    ).to.eql([Bob])

    // array-contains-any with cursor
    expect(
      await db.get(
        "ppl",
        ["letters", "array-contains-any", ["b", "j"]],
        ["startAfter", beth],
      ),
    ).to.eql([Bob, John])

    // where in with cursor
    expect(
      await db.get("ppl", ["age", "in", [20, 30]], ["startAfter", alice]),
    ).to.eql([Beth])

    // where not-in with cursor
    expect(
      await db.get(
        "ppl",
        ["age"],
        ["age", "not-in", [20, 30]],
        ["startAfter", john],
      ),
    ).to.eql([])

    // where =! with cursor
    expect(
      await db.get("ppl", ["age"], ["age", "!=", 30], ["startAfter", bob]),
    ).to.eql([John])

    // desc/reverse tests
    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", ">", 20],
        ["startAfter", john],
      ),
    ).to.eql([Beth, Alice])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", ">=", 30],
        ["startAt", beth],
        ["endAt", beth],
      ),
    ).to.eql([Beth])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "<", 40],
        ["startAt", alice],
      ),
    ).to.eql([Alice, Bob])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "<=", 40],
        ["startAfter", alice],
      ),
    ).to.eql([Bob])
    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "<", 40],
        ["startAfter", alice],
      ),
    ).to.eql([Bob])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", ">", 20],
        ["endBefore", alice],
      ),
    ).to.eql([John, Beth])

    expect(
      await db.get("ppl", ["age", "desc"], ["age", ">=", 30], ["endAt", alice]),
    ).to.eql([John, Beth, Alice])

    expect(
      await db.get("ppl", ["age", "desc"], ["age", "<", 40], ["endAt", bob]),
    ).to.eql([Beth, Alice, Bob])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "<=", 40],
        ["endBefore", bob],
      ),
    ).to.eql([John, Beth, Alice])

    // in with desc
    expect(await db.get("ppl", ["age", "asc"], ["age", "in", [40, 20]])).to.eql(
      [Bob, John],
    )
    expect(
      await db.get("ppl", ["age", "desc"], ["age", "in", [40, 20]]),
    ).to.eql([John, Bob])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "in", [40, 20]],
        ["startAfter", john],
      ),
    ).to.eql([Bob])
    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "in", [40, 20]],
        ["startAt", john],
        ["endBefore", bob],
      ),
    ).to.eql([John])
    expect(await db.get("ppl", ["age", "not-in", [40, 20]])).to.eql([
      Alice,
      Beth,
    ])

    expect(
      await db.get("ppl", ["age", "desc"], ["age", "not-in", [40, 20]]),
    ).to.eql([Beth, Alice])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "not-in", [40, 20]],
        ["startAfter", beth],
      ),
    ).to.eql([Alice])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "!=", 30],
        ["startAfter", john],
      ),
    ).to.eql([Bob])

    await db.addIndex(
      [
        ["letters", "array"],
        ["age", "desc"],
      ],
      "ppl",
      {
        ar: arweave_wallet,
      },
    )

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["letters", "array-contains", "b"],
        ["age", "in", [20, 40]],
        ["startAt", bob],
      ),
    ).to.eql([Bob])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["letters", "array-contains-any", ["b", "j"]],
        ["age", "in", [20, 40]],
        ["startAt", john],
      ),
    ).to.eql([John, Beth, Bob])
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
      "Bob",
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
      [data3],
    )
  },

  "should parse queries": async ({ db }) => {
    expect(parseQuery(["ppl", ["age", "==", 4]]).queries[0].opt).to.eql({
      limit: 1000,
      startAt: { age: 4 },
      endAt: { age: 4 },
    })
  },

  "should only allow add": async ({ db, arweave_wallet }) => {
    const rules = {
      "allow create": { "==": [{ var: "request.func" }, "add"] },
    }
    await db.setRules(rules, "ppl", { ar: arweave_wallet })
    const data = { name: "Bob", age: 20 }
    await db.set(data, "ppl", "Bob")
    expect((await db.get("ppl")).length).to.eql(0)
    await db.add(data, "ppl")
    expect((await db.get("ppl")).length).to.eql(1)
  },

  "should execute custom queries": async ({ db, arweave_wallet }) => {
    const rules = ["set:reg", [["allow()", true]], "set", [["allow()", true]]]
    await db.setRules(rules, "ppl", { ar: arweave_wallet })

    const data = { name: "Bob", age: 20 }
    await db.query("set:reg", data, "ppl", "Bob")
    expect(await db.get("ppl", "Bob")).to.eql(data)
  },

  "should set bundlers": async ({
    db,
    walletAddress,
    arweave_wallet,
    contractTxId,
  }) => {
    const bundlers = [walletAddress]
    await db.setBundlers(bundlers, { ar: arweave_wallet })
    expect(await db.getBundlers()).to.eql(bundlers)
    const date = Date.now()
    const qs = [
      await db.sign("add", {}, "ppl"),
      await db.sign("add", {}, "ppl"),
    ]
    let ids = []
    for (let [i, v] of qs.entries()) {
      ids.push(await getId(contractTxId, v, date + i))
    }
    const hash = await getHash(ids)
    const new_hash = await getNewHash(contractTxId, hash)
    const tx = await db.bundle(qs, {
      t: [date, date + 1],
      n: 1,
      h: new_hash,
    })
    expect(tx.success).to.eql(true)
    const tx2 = await db.add({}, "ppl", { ar: arweave_wallet })
    expect(tx2.success).to.eql(false)

    await db.setBundlers(["0xabc"], { ar: arweave_wallet })
    const tx3 = await db.bundle([await db.sign("add", {}, "ppl")])
    expect(tx2.success).to.eql(false)
    return
  },

  "should add index": async ({ db, arweave_wallet }) => {
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

    await db.addIndex([["name"], ["age"]], "ppl", {
      ar: arweave_wallet,
    })

    expect(
      await db.get("ppl", ["name"], ["age"], ["name", "in", ["Alice", "John"]]),
    ).to.eql([data2, data4])
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

      [
        ["name", "asc"],
        ["age", "asc"],
      ],
    ])
  },
  "should add array indexes": async ({ db, arweave_wallet }) => {
    const index = [
      ["favs", "array"],
      ["date", "desc"],
    ]
    await db.addIndex(index, "ppl", {
      ar: arweave_wallet,
    })
    const bob = { favs: ["food", "juice"], name: "bob", date: 1 }
    const alice = { favs: ["food", "cars"], name: "alice", date: 2 }
    expect((await db.getIndexes("ppl"))[0]).to.eql(index)
    await db.add(bob, "ppl")
    await db.add(alice, "ppl")
    expect(
      await db.get("ppl", ["favs", "array-contains", "food"], ["date", "desc"]),
    ).to.eql([alice, bob])
  },
  "should force inequality come before sort": async ({
    db,
    arweave_wallet,
  }) => {
    await db.addIndex([["a"], ["age"]], "ppl", {
      ar: arweave_wallet,
    })
    const bob = { age: 1, a: 1 }
    await db.add(bob, "ppl")
    let err = false
    try {
      await db.get("ppl", ["age"], ["a", "!=", [1]])
    } catch (e) {
      err = true
    }
    expect(err).to.eql(true)
    expect(await db.get("ppl", ["age"], ["a", "in", [1]])).to.eql([bob])
  },
  "should run triggers": async ({ db, arweave_wallet }) => {
    const trigger = {
      key: "inc-count",
      version: 2,
      on: "create",
      func: [
        ["=$art", ["get()", ["posts", { var: "data.after.aid" }]]],
        ["=$week", ["subtract", { var: "block.timestamp" }, 60 * 60 * 24 * 7]],
        [
          "=$new_pt",
          [
            "add",
            1,
            [
              "multiply",
              ["defaultTo", 0, { var: "art.pt" }],
              [
                "subtract",
                1,
                [
                  "divide",
                  [
                    "subtract",
                    { var: "block.timestamp" },
                    ["defaultTo", { var: "week" }, { var: "art.ptts" }],
                  ],
                  { var: "week" },
                ],
              ],
            ],
          ],
        ],
        [
          "update()",
          [
            {
              likes: db.inc(1),
              pt: { var: "new_pt" },
              ptts: db.ts(),
              last_like: db.ts(),
            },
            "posts",
            { var: `data.after.aid` },
          ],
        ],
      ],
    }
    await db.addTrigger(trigger, "likes", { ar: arweave_wallet })
    await db.set({ id: "id-1", likes: 3 }, "posts", "id-1", {
      ar: arweave_wallet,
    })
    await db.add({ aid: "id-1" }, "likes", { ar: arweave_wallet })
    await db.add({ aid: "id-1" }, "likes", { ar: arweave_wallet })
    await db.add({ aid: "id-1" }, "likes", { ar: arweave_wallet })
    expect((await db.get("posts", "id-1")).likes).to.eql(6)
  },
  "should handle conditions with cron": async ({ db, arweave_wallet }) => {
    await db.set({ age: 1 }, "ppl", "Bob")
    await db.addCron(
      {
        do: true,
        version: 2,
        times: 1,
        span: 1,
        jobs: [["update()", [{ age: db.inc(1) }, "ppl", "Bob"]]],
      },
      "inc_age",
      {
        ar: arweave_wallet,
      },
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(2)

    await db.addCron(
      {
        do: true,
        version: 2,
        times: 1,
        span: 1,
        jobs: [["break"], ["update()", [{ age: db.inc(1) }, "ppl", "Bob"]]],
      },
      "inc_age",
      {
        ar: arweave_wallet,
      },
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(2)

    await db.addCron(
      {
        do: true,
        version: 2,
        times: 1,
        span: 1,
        jobs: [["break"], ["update()", [{ age: db.inc(1) }, "ppl", "Bob"]]],
      },
      "inc_age",
      {
        ar: arweave_wallet,
      },
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(2)

    await db.addCron(
      {
        do: true,
        version: 2,
        times: 1,
        span: 1,
        jobs: [
          [
            "if",
            ["identity", false],
            ["update()", [{ age: db.inc(1) }, "ppl", "Bob"]],
          ],
        ],
      },
      "inc_age",
      {
        ar: arweave_wallet,
      },
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(2)

    await db.addCron(
      {
        do: true,
        version: 2,
        times: 1,
        span: 1,
        jobs: [
          [
            "if",
            ["identity", true],
            ["update()", [{ age: db.inc(1) }, "ppl", "Bob"]],
          ],
        ],
      },
      "inc_age",
      {
        ar: arweave_wallet,
      },
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(3)

    await db.addCron(
      {
        do: true,
        version: 2,
        times: 1,
        span: 1,
        jobs: [
          [
            "if",
            ["identity", false],
            ["update()", [{ age: db.inc(1) }, "ppl", "Bob"]],
            "else",
            ["update()", [{ age: db.inc(2) }, "ppl", "Bob"]],
          ],
        ],
      },
      "inc_age",
      {
        ar: arweave_wallet,
      },
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(5)
  },
  "should tick": async ({ db, arweave_wallet }) => {
    await db.addCron(
      {
        version: 2,
        span: 1,
        times: 2,
        jobs: [["get", "ppl", ["ppl"]]],
      },
      "ticker",
      {
        ar: arweave_wallet,
      },
    )
    let success = false
    while (true) {
      await sleep(1000)
      const tx = await db.tick()
      if (tx.success) {
        success = true
        break
      }
    }
    expect(success).to.eql(true)
  },
  "should get in access control rules": async ({ db, arweave_wallet }) => {
    await db.set({ name: "Bob", age: 20 }, "users", "Bob")
    const rules = [
      [
        "create",
        [
          ["=$bob", ["get()", ["users", "$new.name"]]],
          ["=$new.age", "$bob.age"],
        ],
      ],
      ["write", [["allow()", true]]],
    ]
    await db.setRules(rules, "ppl", { ar: arweave_wallet })
    await db.set({ name: "Bob" }, "ppl", "Bob")
    expect((await db.get("ppl", "Bob")).age).to.eql(20)
  },
  "should allow if/ifelse in access control rules": async ({
    db,
    arweave_wallet,
  }) => {
    const rules = {
      "let create": {
        "resource.newData.age": [
          "ifelse",
          ["equals", "Bob", { var: "resource.newData.name" }],
          20,
          30,
        ],
      },
      "allow create": true,
    }
    await db.setRules(rules, "ppl", { ar: arweave_wallet })
    await db.set({ name: "Bob" }, "ppl", "Bob")
    expect((await db.get("ppl", "Bob")).age).to.eql(20)
    await db.set({ name: "Alice" }, "ppl", "Alice")
    expect((await db.get("ppl", "Alice")).age).to.eql(30)
  },
  "should change method name in access control rules": async ({
    db,
    arweave_wallet,
  }) => {
    const rules = {
      "let create": {
        "request.method": [
          "if",
          ["equals", "Bob", { var: "resource.newData.name" }],
          "Bob",
        ],
      },
      "allow Bob": true,
    }
    await db.setRules(rules, "ppl", { ar: arweave_wallet })
    await db.set({ name: "Bob" }, "ppl", "Bob", { ar: arweave_wallet })
    expect((await db.get("ppl", "Bob")).name).to.eql("Bob")
    await db.set({ name: "Alice" }, "ppl", "Alice", { ar: arweave_wallet })
    expect(await db.get("ppl", "Alice")).to.eql(null)
  },

  "should set rules": async ({ db, arweave_wallet }) => {
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
  },
  "should set rules with key": async ({ db, arweave_wallet }) => {
    const data = { name: "Bob", age: 20 }
    const rules = [["allow()"]]
    await db.setRules(rules, "ppl", "set:test#one", { ar: arweave_wallet })
    const rules2 = [["deny()"]]
    await db.setRules(rules2, "ppl", "delete", { ar: arweave_wallet })
    await db.setRules(rules2, "ppl", "set:test#one", { ar: arweave_wallet })
    expect(await db.getRules("ppl")).to.eql([
      ["set:test#one", rules2],
      ["delete", rules2],
    ])
    await db.setRules(rules2, "ppl", "set:test#one@1", { ar: arweave_wallet })
    expect(await db.getRules("ppl")).to.eql([
      ["delete", rules2],
      ["set:test#one", rules2],
    ])
    await db.setRules(db.del(), "ppl", "set:test#one@1", { ar: arweave_wallet })
    expect(await db.getRules("ppl")).to.eql([["delete", rules2]])
  },

  "should pre-process the new data with rules": async ({
    db,
    arweave_wallet,
  }) => {
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
  },

  "should execute crons": async ({ db, arweave_wallet, type }) => {
    await db.set({ age: 3 }, "ppl", "Bob")
    await db.addCron(
      {
        span: 2,
        times: 2,
        do: true,
        version: 2,
        jobs: [["upsert()", [{ age: db.inc(1) }, "ppl", "Bob"]]],
      },
      "inc age",
      {
        ar: arweave_wallet,
      },
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(4)
    while (true) {
      if (type !== "offchain") await db.mineBlock()
      await sleep(1000)
      await db.set({}, "ppl", "Alice")
      if ((await db.get("ppl", "Bob")).age > 4) {
        break
      }
    }
    expect((await db.get("ppl", "Bob")).age).to.be.eql(5)
    await db.removeCron("inc age", {
      ar: arweave_wallet,
    })
    expect((await db.getCrons()).crons).to.eql({})
  },

  "should insert contract info into access rules": async ({
    db,
    arweave_wallet,
    contractTxId,
  }) => {
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
        data,
      ),
    )
  },

  "should batch execute admin methods": async ({ db, arweave_wallet }) => {
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
      version: 2,
      jobs: [["add", [{ age: db.inc(1) }, "ppl"]]],
    }
    const trigger = {
      key: "inc-count",
      on: "create",
      version: 2,
      func: [["upsert()", [{ count: db.inc(1) }, "like-count", "$data.id"]]],
    }

    const tx = await db.batch(
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
        ["addTrigger", trigger, "ppl"],
      ],
      {
        ar: arweave_wallet,
      },
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
    expect((await db.getTriggers("ppl"))[0]).to.eql(trigger)
    await db.batch(
      [
        ["removeCron", "inc age"],
        ["removeOwner", addr2],
        ["removeIndex", index, "ppl"],
        ["removeRelayerJob", jobID],
      ],
      {
        ar: arweave_wallet,
      },
    )
    expect((await db.getCrons()).crons).to.eql({})
    expect(await db.getOwner()).to.eql([addr])
    expect(await db.getIndexes("ppl")).to.eql([])
    expect(await db.getRelayerJob(jobID)).to.eql(null)
  },

  "should add triggers": async ({ db, arweave_wallet }) => {
    const data1 = {
      key: "trg",
      version: 2,
      on: "create",
      func: [
        [
          "when",
          ["propEq", "id", "Bob"],
          ["toBatch", ["update", { age: db.inc(2) }, "ppl", "Bob"]],
          { var: "data" },
        ],
      ],
    }
    const data2 = {
      key: "trg2",
      version: 2,
      on: "update",
      func: [["upsert()", [{ name: "Alice", age: db.inc(1) }, "ppl", "Alice"]]],
    }
    const data3 = {
      key: "trg3",
      version: 2,
      on: "delete",
      func: [["update()", [{ age: db.inc(1) }, "ppl", "Bob"]]],
    }
    await db.addTrigger(data1, "ppl", { ar: arweave_wallet })
    await db.addTrigger(data2, "ppl", { ar: arweave_wallet })
    await db.addTrigger(mergeLeft({ index: 0 }, data3), "ppl", {
      ar: arweave_wallet,
    })
    expect(await db.getTriggers("ppl")).to.eql([data3, data1, data2])
    await db.set({ name: "Bob", age: 20 }, "ppl", "Bob")
    expect((await db.get("ppl", "Bob")).age).to.eql(22)
    return
    await db.removeTrigger("trg2", "ppl", { ar: arweave_wallet })
    expect(await db.getTriggers("ppl")).to.eql([data3, data1])

    const trigger = {
      key: "inc-count",
      on: "create",
      version: 2,
      func: [
        ["upsert()", [{ count: db.inc(1) }, "like-count", { var: "data.id" }]],
      ],
    }
    await db.addTrigger(trigger, "likes", { ar: arweave_wallet })
    await db.set({ data: Date.now() }, "likes", "abc")
    expect((await db.get("like-count", "abc")).count).to.equal(1)
  },
  "should process nostr events": async ({ db, arweave_wallet }) => {
    const rule = [
      [
        "set:nostr_events",
        [
          ["=$event", ["get()", ["nostr_events", "$id"]]],
          ["if", "o$event", ["deny()"]],
          ["allow()"],
        ],
      ],
    ]
    await db.setRules(rule, "nostr_events", { ar: arweave_wallet })
    const trigger = {
      key: "nostr_events",
      on: "create",
      version: 2,
      func: [
        [
          "if",
          ["equals", 1, "$data.after.kind"],
          [
            "set()",
            [
              {
                id: "$data.id",
                owner: "$data.after.pubkey",
                type: "status",
                description: "$data.after.content",
                date: "$data.after.created_at",
                repost: "",
                reply_to: "",
                reply: false,
                quote: false,
                parents: [],
                hashes: [],
                mentions: [],
                repost: 0,
                quotes: 0,
                comments: 0,
              },
              "posts",
              "$data.id",
            ],
          ],
        ],
        [
          "if",
          ["equals", 0, "$data.after.kind"],
          [
            "[]",
            ["=$profile", ["parse()", "$data.after.content"]],
            [
              "set()",
              [
                {
                  name: "$profile.name",
                  address: "$data.after.pubkey",
                  followers: 0,
                  following: 0,
                },
                "users",
                "$data.after.pubkey",
              ],
            ],
          ],
        ],
      ],
    }
    await db.addTrigger(trigger, "nostr_events", { ar: arweave_wallet })

    let sk = generatePrivateKey()
    let pubkey = getPublicKey(sk)

    let event = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: "hello",
      pubkey,
    }
    event.id = getEventHash(event)
    event.sig = getSignature(event, sk)
    await db.nostr(event)
    await db.nostr(event)
    let event2 = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: "hello2",
      pubkey,
    }
    event2.id = getEventHash(event2)
    event2.sig = getSignature(event2, sk)
    await db.nostr(event2)
    let event3 = {
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify({
        name: "user",
        about: "test user",
        picture: "https://example.com/avatar.png",
      }),
      pubkey,
    }
    event3.id = getEventHash(event3)
    event3.sig = getSignature(event3, sk)
    await db.nostr(event3)
  },
  "should record nostr users": async ({ db, arweave_wallet }) => {
    const schema = {
      type: "object",
      required: ["address"],
      properties: {
        address: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        invited_by: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        name: { type: "string", minLength: 1, maxLength: 50 },
        handle: { type: "string", minLength: 3, maxLength: 15 },
        image: { type: "string" },
        cover: { type: "string" },
        description: { type: "string", maxLength: 280 },
        hashes: { type: "array", items: { type: "string" } },
        mentions: { type: "array", items: { type: "string" } },
        followers: { type: "number", multipleOf: 1 },
        following: { type: "number", multipleOf: 1 },
        invites: { type: "number", multipleOf: 1 },
        invited: { type: "number", multipleOf: 1 },
      },
    }
    await db.setSchema(schema, "users", { ar: arweave_wallet })
    const func = [
      [
        "if",
        ["equals", 0, "$data.after.kind"],
        [
          "[]",
          ["=$profile", ["parse()", "$data.after.content"]],
          ["=$old_profile", ["get()", ["users", "$data.id"]]],
          ["=$new_profile", { address: "$data.after.pubkey" }],
          [
            "if",
            "x$old_profile",
            [
              "[]",
              ["=$new_profile.followers", 0],
              ["=$new_profile.following", 0],
            ],
          ],
          ["if", "o$profile.name", ["=$new_profile.name", "$profile.name"]],
          ["=$new_profile.description", ["defaultTo", "", "$profile.about"]],
          [
            "if",
            "o$profile.picture",
            ["=$new_profile.image", "$profile.picture"],
          ],
          [
            "if",
            "o$profile.banner",
            ["=$new_profile.cover", "$profile.banner"],
          ],
          ["upsert()", ["$new_profile", "users", "$data.after.pubkey"]],
        ],
      ],
    ]

    const trigger = { key: "nostr_events", on: "create", version: 2, func }
    await db.addTrigger(trigger, "nostr_events", { ar: arweave_wallet })
    let sk = generatePrivateKey()
    let pubkey = getPublicKey(sk)

    let event = {
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify({ name: "user", about: "test user" }),
      pubkey,
    }
    event.id = getEventHash(event)
    event.sig = getSignature(event, sk)
    await db.nostr(event)
  },
  "should record nostr posts": async ({ db, arweave_wallet }) => {
    const schema = {
      type: "object",
      required: ["owner", "id"],
      properties: {
        id: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        owner: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        date: { type: "number", multipleOf: 1 },
        updated: { type: "number", multipleOf: 1 },
        description: { type: "string", maxLength: 280 },
        title: { type: "string", minLength: 1, maxLength: 100 },
        type: { type: "string" },
        reply_to: { type: "string" },
        repost: { type: "string" },
        reply: { type: "boolean" },
        quote: { type: "boolean" },
        parents: {
          type: "array",
          items: { type: "string", pattern: "^[0-9a-zA-Z]{64,64}$" },
        },
        hashes: { type: "array", items: { type: "string" } },
        mentions: { type: "array", items: { type: "string" } },
        pt: { type: "number" },
        ptts: { type: "number", multipleOf: 1 },
        last_like: { type: "number", multipleOf: 1 },
        likes: { type: "number", multipleOf: 1 },
        reposts: { type: "number", multipleOf: 1 },
        quotes: { type: "number", multipleOf: 1 },
        comments: { type: "number", multipleOf: 1 },
      },
    }
    await db.setSchema(schema, "posts", { ar: arweave_wallet })

    let sk = generatePrivateKey()
    let pubkey = getPublicKey(sk)

    const func = [
      [
        "if",
        ["equals", 1, "$data.after.kind"],
        [
          "[]",
          ["=$tags", ["defaultTo", [], "$data.after.tags"]],
          [
            "=$mentions",
            [
              [
                "pipe",
                ["filter", ["propSatisfies", ["equals", "p"], 0]],
                ["map", ["nth", 1]],
              ],
              "$tags",
            ],
          ],
          [
            "=$etags",
            [["filter", ["propSatisfies", ["equals", "e"], 0]], "$tags"],
          ],
          [
            "=$quote_tags",
            [
              [
                "pipe",
                ["filter", ["propSatisfies", ["equals", "mention"], 3]],
                ["map", ["nth", 1]],
              ],
              "$etags",
            ],
          ],
          [
            "=$repost",
            [
              "if",
              ["isEmpty", "$quote_tags"],
              "",
              "else",
              ["head", "$quote_tags"],
            ],
          ],
          ["=$no_quote", ["isEmpty", "$repost"]],
          ["=$quote", "!$no_quote"],

          [
            "=$reply_tags",
            [
              [
                "pipe",
                ["filter", ["propSatisfies", ["equals", "reply"], 3]],
                ["map", ["nth", 1]],
              ],
              "$etags",
            ],
          ],
          [
            "=$reply_to",
            [
              "if",
              ["isEmpty", "$reply_tags"],
              "",
              "else",
              ["last", "$reply_tags"],
            ],
          ],
          ["=$no_reply", ["isEmpty", "$reply_to"]],
          ["=$is_mark", "!$no_reply"],
          [
            "if",
            "$no_reply",
            [
              "[]",
              [
                "=$reply_tags",
                [
                  [
                    "pipe",
                    ["filter", ["propSatisfies", ["equals", "root"], 3]],
                    ["map", ["nth", 1]],
                  ],
                  "$etags",
                ],
              ],
              [
                "=$reply_to",
                [
                  "if",
                  ["isEmpty", "$reply_tags"],
                  "",
                  "else",
                  ["last", "$reply_tags"],
                ],
              ],
            ],
          ],
          ["=$no_reply", ["isEmpty", "$reply_to"]],
          ["=$is_mark", "!$no_reply"],
          [
            "if",
            "$no_reply",
            [
              "[]",
              [
                "=$reply_tags",
                [
                  [
                    "pipe",
                    [
                      "filter",
                      [
                        "propSatisfies",
                        ["either", ["equals", ""], ["isNil"]],
                        3,
                      ],
                    ],
                    ["map", ["nth", 1]],
                  ],
                  "$etags",
                ],
              ],
              [
                "=$reply_to",
                [
                  "if",
                  ["isEmpty", "$reply_tags"],
                  "",
                  "else",
                  ["last", "$reply_tags"],
                ],
              ],
            ],
          ],
          ["=$no_reply", ["isEmpty", "$reply_to"]],
          ["=$reply", "!$no_reply"],
          ["=$parents", []],
          [
            "if",
            "$is_mark",
            [
              "=$parents",
              [
                [
                  "pipe",
                  [
                    "filter",
                    [
                      "propSatisfies",
                      ["includes", ["__"], ["[]", "root", "reply"]],
                      3,
                    ],
                  ],
                  ["map", ["nth", 1]],
                ],
                "$etags",
              ],
            ],
            "elif",
            "$reply",
            [
              "=$parents",
              [
                [
                  "pipe",
                  [
                    "filter",
                    ["propSatisfies", ["either", ["equals", ""], ["isNil"]], 3],
                  ],
                  ["map", ["nth", 1]],
                ],
                "$etags",
              ],
            ],
          ],
          [
            "set()",
            [
              {
                id: "$data.id",
                owner: "$data.after.pubkey",
                type: "status",
                description: "$data.after.content",
                date: "$data.after.created_at",
                repost: "$repost",
                reply_to: "$reply_to",
                reply: "$reply",
                quote: "$quote",
                parents: "$parents",
                hashes: [],
                mentions: "$mentions",
                likes: 0,
                reposts: 0,
                quotes: 0,
                comments: 0,
              },
              "posts",
              "$data.id",
            ],
          ],
        ],
      ],
    ]

    const trigger2 = { key: "nostr_events", on: "create", version: 2, func }
    await db.addTrigger(trigger2, "nostr_events", { ar: arweave_wallet })

    const trigger = {
      key: "inc_reposts",
      version: 2,
      on: "create",
      func: [
        [
          [
            "unless",
            ["pathEq", ["after", "repost"], ""],
            [
              "toBatch",
              ["update", { reposts: db.inc(1) }, "posts", "$data.after.repost"],
            ],
            "$data",
          ],
          [
            "when",
            [
              "both",
              [["complement", ["pathEq"]], ["after", "repost"], ""],
              [
                ["complement", ["pathSatisfies"]],
                ["isNil"],
                ["after", "description"],
              ],
            ],
            [
              "toBatch",
              ["update", { quotes: db.inc(1) }, "posts", "$data.after.repost"],
            ],
            "$data",
          ],
        ],
      ],
    }
    await db.addTrigger(trigger, "posts", { ar: arweave_wallet })
    let event = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      content: "what the hell",
      pubkey,
      tags: [],
    }
    event = finishEvent(event, sk)
    await db.nostr(event)

    let event2 = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["p", sk],
        ["e", event.id, "", "mention"],
      ],
      content: "what the hell #2",
      pubkey,
    }
    event2 = finishEvent(event2, sk)
    await db.nostr(event)
    await db.nostr(event2)

    // one, two, multi, reply, root
    let event3 = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["p", sk],
        ["e", event.id, "root"],
        ["e", event.id],
      ],
      content: "what the hell #2",
      pubkey,
    }
    event3 = finishEvent(event3, sk)
    await db.nostr(event3)
  },
  "should chain hashes": async ({
    db,
    walletAddress,
    arweave_wallet,
    contractTxId,
  }) => {
    const bundlers = [walletAddress]
    await db.setBundlers(bundlers, { ar: arweave_wallet })
    let qs2 = []
    const date = Date.now()
    for (let v of range(0, 10)) {
      const sign = await db.sign("add", { test: v + 1 }, "ppl", {
        nonce: v + 1,
      })
      const id = await getId(contractTxId, sign, date + v)
      qs2.push({ sign, id, date: date + v })
    }
    const chunks = [[0], [1, 2], [3, 4], [5, 6, 7], [8, 9]]
    let prev = contractTxId
    let hashes = []
    let signs = []
    let tss = []
    for (let v of chunks) {
      let ids = []
      let ts = []
      let q = []
      for (let v2 of v) {
        const sign = qs2[v2].sign
        q.push(sign)
        const id = await getId(contractTxId, sign, qs2[v2].date)
        ids.push(id)
        ts.push(qs2[v2].date)
      }
      const hash = await getHash(ids)
      const newHash = await getNewHash(prev, hash)
      hashes.push(newHash)
      prev = newHash
      signs.push(q)
      tss.push(ts)
    }

    const order = [0, 2, 3, 1, 4]
    for (let v of order) {
      await db.bundle(signs[v], {
        n: v + 1,
        t: tss[v],
        h: hashes[v],
      })
    }
    expect((await db.getInfo()).rollup.height).to.eql(5)
    expect(pluck("test", await db.get("ppl", ["test"]))).to.eql(range(1, 11))
    return
  },
  "should accept rollup queries in random order": async ({
    db,
    walletAddress,
    arweave_wallet,
    contractTxId,
  }) => {
    const bundlers = [walletAddress]
    await db.setBundlers(bundlers, { ar: arweave_wallet })
    const qs = [
      await db.sign("add", { test: "a" }, "ppl", { nonce: 1 }),
      await db.sign("add", { test: "b" }, "ppl", { nonce: 2 }),
      await db.sign("add", { test: "c" }, "ppl", { nonce: 3 }),
      await db.sign("add", { test: "d" }, "ppl", { nonce: 4 }),
      await db.sign("add", { test: "e" }, "ppl", { nonce: 5 }),
      await db.sign("add", { test: "f" }, "ppl", { nonce: 6 }),
    ]
    const chunks = [[0], [1, 2], [3, 4], [5]]
    const b = [[qs[0]], [qs[3], qs[4]], [qs[5]], [qs[1], qs[2]]]
    const date = Date.now()
    let i = 0
    let ids = []
    for (let v of qs) ids.push(await getId(contractTxId, v, date + i++))
    let hashes = []
    for (let [i, v] of chunks.entries()) {
      const prev = i === 0 ? contractTxId : hashes[i - 1]
      const hash = await getHash(map(v2 => ids[v2])(v))
      hashes.push(await getNewHash(prev, hash))
    }
    const tx = await db.bundle(b[0], {
      n: 1,
      t: [date],
      h: hashes[0],
    })
    expect(await db.getValidities(tx.originalTxId)).to.eql([[ids[0], 1, 0]])
    const tx2 = await db.bundle(b[1], {
      h: hashes[2],
      n: 3,
      t: [date + 3, date + 4],
    })
    expect(await db.getValidities(tx2.originalTxId)).to.eql([
      [ids[3], 3, 2],
      [ids[4], 3, 2],
    ])
    const tx3 = await db.bundle(b[2], {
      h: hashes[3],
      n: 4,
      t: [date + 5],
    })
    expect(await db.getValidities(tx3.originalTxId)).to.eql([[ids[5], 4, 2]])

    expect(pluck("test", await db.get("ppl", ["test"]))).to.eql(["a"])
    const tx4 = await db.bundle(b[3], {
      q: b[3],
      h: hashes[1],
      n: 2,
      t: [date + 1, date + 2],
    })
    expect(await db.getValidities(tx4.originalTxId)).to.eql([
      [ids[1], 2, 0],
      [ids[2], 2, 0],
      [ids[3], 3, 0],
      [ids[4], 3, 0],
      [ids[5], 4, 0],
    ])
    expect(pluck("test", await db.get("ppl", ["test"]))).to.eql([
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
    ])
    return
  },
  "should bundle mulitple transactions": async ({ db }) => {
    const wallet2 = EthCrypto.createIdentity()
    const wallet3 = EthCrypto.createIdentity()
    const wallet4 = EthCrypto.createIdentity()
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", age: 30 }
    const params = await db.sign("set", data, "ppl", "Bob", {
      privateKey: wallet2.privateKey,
    })
    const params2 = await db.sign("upsert", data2, "ppl", "Alice", {
      privateKey: wallet3.privateKey,
    })
    const params3 = await db.sign("update", {}, "ppl", "Beth", {
      privateKey: wallet4.privateKey,
    })

    const tx = await db.bundle([params, params3, params2])
    expect(await db.getValidities(tx.originalTxId)).to.eql([true, false, true])
    expect(await db.get("ppl", "Bob")).to.eql(data)
    expect(await db.get("ppl", "Alice")).to.eql(data2)
  },
  "should auto-execute batch queries with FPJSON": async ({
    db,
    arweave_wallet,
  }) => {
    const data1 = {
      key: "trg",
      version: 2,
      on: "create",
      func: [["toBatch()", ["add", {}, "ppl"]]],
    }
    await db.addTrigger(data1, "ppl", { ar: arweave_wallet })
    await db.add({}, "ppl")
    expect(await db.get("ppl")).to.eql([{}, {}])

    const data2 = {
      key: "trg2",
      version: 2,
      on: "create",
      func: [
        [
          "toBatchAll()",
          [
            ["add", { num: 2 }, "ppl3"],
            ["add", { num: 3 }, "ppl3"],
          ],
        ],
      ],
    }
    await db.addTrigger(data2, "ppl2", { ar: arweave_wallet })
    await db.add({ num: 1 }, "ppl2")
    expect(await db.get("ppl3", ["num", "asc"])).to.eql([
      { num: 2 },
      { num: 3 },
    ])

    const data3 = {
      key: "trg2",
      version: 2,
      on: "create",
      func: [
        [
          "when",
          ["always", true],
          ["toBatch", ["add", { num: 4 }, "ppl5"]],
          true,
        ],
      ],
    }
    await db.addTrigger(data3, "ppl4", { ar: arweave_wallet })
    await db.add({ num: 1 }, "ppl4")
    expect(await db.get("ppl5")).to.eql([{ num: 4 }])
  },

  "should verify zkp.skip": async ({ db, arweave_wallet }) => {
    let dataStorage, credentialWallet, identityWallet
    ;({ dataStorage, credentialWallet, identityWallet } =
      await initInMemoryDataStorageAndWallets())
    const circuitStorage = await initCircuitStorage()
    const proofService = await initProofService(
      identityWallet,
      credentialWallet,
      dataStorage.states,
      circuitStorage,
    )
    const { did: userDID, credential: authBJJCredentialUser } =
      await createIdentity(identityWallet)
    const { did: issuerDID, credential: issuerAuthBJJCredential } =
      await createIdentity(identityWallet)
    const id = userDID.string()
    const data = {
      id,
      birthday: 19960424,
      documentType: 5,
    }
    const req = {
      documentType: {
        $lt: 6,
      },
    }
    const credentialRequest = createCred(data)
    const credential = await identityWallet.issueCredential(
      issuerDID,
      credentialRequest,
    )

    await dataStorage.credential.saveCredential(credential)
    const proofReqSig = createReq(credentialRequest, req)
    const { proof, pub_signals } = await proofService.generateProof(
      proofReqSig,
      userDID,
    )

    await db.add({ test: db.zkp(proof, pub_signals) }, "ppl")
    expect((await db.get("ppl"))[0].test.pub_signals.userID).to.eql(id)
  },
  "should link did.skip": async ({ db, arweave_wallet, wallet }) => {
    let dataStorage, credentialWallet, identityWallet
    ;({ dataStorage, credentialWallet, identityWallet } =
      await initInMemoryDataStorageAndWallets())
    const circuitStorage = await initCircuitStorage()
    const proofService = await initProofService(
      identityWallet,
      credentialWallet,
      dataStorage.states,
      circuitStorage,
    )
    const { did: userDID, credential: authBJJCredentialUser } =
      await createIdentity(identityWallet)
    const { did: issuerDID, credential: issuerAuthBJJCredential } =
      await createIdentity(identityWallet)
    const id = userDID.string()
    const tempAddr = EthCrypto.createIdentity()
    const addr = tempAddr.address
    const num = BigInt(addr).toString().slice(0, 15) * 1
    const num2 = BigInt(addr).toString().slice(15, 30) * 1
    const credentialRequest = createCred({
      id,
      birthday: num,
      documentType: num2,
    })
    const credential = await identityWallet.issueCredential(
      issuerDID,
      credentialRequest,
    )
    await dataStorage.credential.saveCredential(credential)
    const proofReqSig = createReq(credentialRequest, {
      birthday: {
        $eq: num,
      },
    })
    const { proof, pub_signals } = await proofService.generateProof(
      proofReqSig,
      userDID,
    )
    const { identity } = await db.createTempAddressWithPolygonID(tempAddr, {
      proof,
      pub_signals,
      did: userDID.string(),
    })
    expect(await db.getAddressLink(identity.address.toLowerCase())).to.eql({
      address: userDID.string(),
      expiry: 0,
    })
  },
  "should download specific version": async ({ arweave_wallet }) => {
    const db = new DB({ type: 3, secure: false, local: true })
    await db.set({ age: 10 }, "ppl", "bob", { ar: arweave_wallet })
    expect(await db.get("ppl")).to.eql([{ age: 10 }])
    await db.set({ age: 15 }, "ppl", "alice", { ar: arweave_wallet })
    expect(await db.get("ppl")).to.eql([{ age: 15 }, { age: 10 }])
  },
  "should skip signature verification": async ({ arweave_wallet, wallet }) => {
    const db = new DB({
      type: 3,
      secure: false,
      local: true,
      _contracts: "../contracts",
      state: {
        auth: {
          algorithms: ["secp256k1", "secp256k1-2", "ed25519", "rsa256"],
          name: "weavedb",
          version: "1",
          skip_validation: true,
        },
      },
    })
    const identity0 = EthCrypto.createIdentity()
    const identity = EthCrypto.createIdentity()

    let queries = []
    for (let i = 0; i < 10000; i++) {
      const sig = await db.sign("upsert", { age: db.inc(1) }, "ppl", "bob", {
        privateKey: identity.privateKey,
        nonce: i + 1,
      })
      queries.push(sig)
    }
    let txs = 0
    const start = Date.now()
    for (let i = 0; i < queries.length; i++) {
      await db.write(queries[i].function, queries[i], true, true, false)
      txs += 1
      const duration = Date.now() - start
      if (duration > 1000) break
    }
    expect(txs).to.be.gt(3500)
    expect(await db.get("ppl", "bob")).to.eql({ age: txs })

    const { identity: identity2 } = await db.createTempAddress(
      identity0.address,
      null,
      null,
      {
        privateKey: identity0.privateKey,
      },
    )
    expect(await db.getAddressLink(identity2.address.toLowerCase())).to.eql({
      address: identity0.address.toLowerCase(),
      expiry: 0,
    })
    await db.upsert({ age: 20 }, "ppl", "bob", {
      privateKey: identity2.privateKey,
      wallet: identity0.address.toLowerCase(),
    })
    expect(await db.get("ppl", "bob")).to.eql({ age: 20 })
    return
  },
  "should deposit tokens": async ({ arweave_wallet, walletAddress }) => {
    // create identities
    const wallet = EthCrypto.createIdentity()
    const wallet2 = EthCrypto.createIdentity()
    const wallet3 = EthCrypto.createIdentity()
    const wallet4 = EthCrypto.createIdentity()
    const owner = EthCrypto.createIdentity()
    const owner2 = EthCrypto.createIdentity()
    const owner3 = EthCrypto.createIdentity()
    const cu = EthCrypto.createIdentity()
    const cu2 = EthCrypto.createIdentity()
    const ath = wallet => ({ privateKey: wallet.privateKey })

    let pool = []
    let hashes = []
    let b = []
    const bundlers = [walletAddress]
    const auth = { privateKey: owner.privateKey }

    // l1 owner and l2 owner must be different, otherwise nonce won't match
    const l1 = new DB({
      type: 3,
      secure: false,
      local: true,
      _contracts: "../contracts",
      state: {
        owner: [owner2.address.toLowerCase(), owner.address.toLowerCase()],
        bridges: ["ethereum"],
      },
      caller: walletAddress,
    })
    await l1.setBundlers(bundlers, ath(owner2))
    const l2 = new DB({
      type: 3,
      secure: false,
      local: true,
      _contracts: "../contracts",
      state: { owner: owner.address.toLowerCase(), bridges: ["ethereum"] },
      caller: walletAddress,
    })
    const date = Date.now()
    const add = async (...params) => {
      const sig = await l2.sign(...params)
      const res = await l2._writeContract(sig.function, sig)
      pool.push(sig)
      return sig
    }
    const commit = async () => {
      let txs = []
      let ids = []
      let dates = []
      let i = 0
      const prev = hashes.length === 0 ? l2.contractTxId : last(hashes)
      do {
        const q = pool.shift()
        txs.push(q)
        const d = date + hashes.length + ++i
        ids.push(await getId(l2.contractTxId, q, d))
        dates.push(d)
      } while (pool.length > 0)
      const hash = await getHash(ids)
      hashes.push(await getNewHash(prev, hash))
      return await l1.bundle(txs, {
        n: hashes.length,
        t: dates,
        h: last(hashes),
      })
    }
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", age: 30 }
    await add("set", data, "ppl", "Bob", ath(wallet2))
    await commit()
    await add("upsert", data2, "ppl", "Alice", ath(wallet3))
    await add("upsert", {}, "ppl", "Beth", ath(wallet4))
    await commit()

    await l1._writeContract(
      "Credit-Notice",
      { function: "Credit-Notice", Quantity: "100" },
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "WDB",
    )
    const tokens = await l1.getTokens()
    expect(tokens.rollup.height).to.eql(2)
    expect(tokens.tokens.available).to.eql({ WDB: "100" })

    // set up relayers
    const cuw = new Wallet(cu.privateKey)
    const cuw2 = new Wallet(cu2.privateKey)

    const jobID = "tokens"
    const job = {
      relayers: [owner3.address],
      signers: [cu.address, cu2.address],
      multisig: 100,
      multisig_type: "percent",
      schema: {
        type: "object",
        required: ["tokens", "height", "last_token_lock_date"],
        properties: {
          tokens: { type: "object" },
          height: { type: "number" },
          last_token_lock_date: { type: "number" },
        },
      },
    }

    await add("addRelayerJob", "tokens", job, auth)
    expect(await l2.getRelayerJob("tokens")).to.eql(job)
    const signed = await l2.sign("lockTokens", {
      jobID,
      ...ath(wallet),
    })
    const extra = {
      tokens: tokens.tokens.available,
      height: tokens.rollup.height,
      last_token_lock_date: tokens.last_token_lock_date,
    }
    const multisig_data = { extra, jobID, params: signed }
    const sig2 = await cuw.signMessage(JSON.stringify(multisig_data))
    const sig3 = await cuw2.signMessage(JSON.stringify(multisig_data))
    const p = await add("relay", "tokens", signed, extra, {
      ...ath(owner3),
      multisigs: [sig2, sig3],
    })

    expect(l2.state.tokens.available_l2.WDB).to.eql("100")
    await commit()
    await sleep(1000)
    expect((await l1.getInfo()).rollup.height).to.eql(3)
    expect(l1.state.tokens.available.WDB).to.eql("0")
    expect(l1.state.tokens.locked.WDB).to.eql("100")
    const rules = [
      ["set:mint", [["allow()", true]]],
      ["update:withdraw", [["allow()", true]]],
    ]
    await add("setRules", rules, "ppl", auth)
    const trigger_mint = {
      key: "mint",
      on: "create",
      version: 2,
      func: [
        [
          "mint()",
          [
            {
              token: "WDB",
              amount: 10,
              to: { var: "data.setter" },
            },
          ],
        ],
        [
          "transfer()",
          [
            {
              token: "WDB",
              amount: 5,
              from: { var: "data.setter" },
              to: wallet2.address.toLowerCase(),
            },
          ],
        ],
      ],
    }
    await add("addTrigger", trigger_mint, "ppl", auth)
    const trigger_withdraw = {
      key: "withdraw",
      on: "update",
      version: 2,
      func: [
        [
          "withdraw()",
          [
            {
              token: "WDB",
              amount: 5,
              from: { var: "data.setter" },
            },
          ],
        ],
      ],
    }
    await add("addTrigger", trigger_withdraw, "ppl", auth)
    const bob = { name: "Bob", age: 20 }
    const wallet_token = EthCrypto.createIdentity()
    const auth2 = { privateKey: wallet_token.privateKey }
    await add("query", "set:mint", data, "ppl", "Bob", auth2)
    expect((await l2.get("__tokens__"))[0].amount).to.eql(5)
    expect((await l2.get("__tokens__"))[1].amount).to.eql(5)
    await add("query", "update:withdraw", { age: 21 }, "ppl", "Bob", auth2)
    expect(
      (await l2.get("__tokens__", ["withdraw", "desc"]))[0].withdraw,
    ).to.eql(5)
    await sleep(1000)

    // bridge token to Ethereum
    const from = wallet_token.address.toLowerCase()
    await add(
      "bridgeToken",
      {
        token: "WDB",
        to: from,
        destination: "ethereum",
        amount: 2,
      },
      auth2,
    )

    // withdraw token to L1
    await add("withdrawToken", { token: "WDB", to: walletAddress }, auth2)
    expect(
      (await l2.get("__tokens__", ["withdraw", "asc"]))[0].withdraw,
    ).to.eql(0)
    const res = await commit()
    await sleep(1000)
    expect((await l1.getInfo()).rollup.height).to.eql(4)
    expect(res.events[0]).to.eql({
      type: "ao_message",
      attributes: [
        { key: "Target", value: "WDB" },
        { key: "Action", value: "Transfer" },
        { key: "Quantity", value: "3" },
        { key: "Recipient", value: walletAddress },
      ],
    })
    const bridge = (await l1.get("__bridge__"))[0]
    expect(bridge).to.eql({
      from,
      amount: 2,
      to: from,
      token: "WDB",
      destination: "ethereum",
    })
  },
}

async function createIdentity(identityWallet) {
  const { did, credential } = await identityWallet.createIdentity({
    method: core.DidMethod.Iden3,
    blockchain: core.Blockchain.Polygon,
    networkId: core.NetworkId.Mumbai,
    revocationOpts: {
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      id: rhsUrl,
    },
  })

  return {
    did,
    credential,
  }
}

function createReq(credentialRequest, subject) {
  return {
    id: 1,
    circuitId: CircuitId.AtomicQuerySigV2,
    optional: false,
    query: {
      allowedIssuers: ["*"],
      type: credentialRequest.type,
      context:
        "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld",
      credentialSubject: subject,
    },
  }
}

function createCred(subject) {
  return {
    credentialSchema:
      "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json",
    type: "KYCAgeCredential",
    credentialSubject: subject,
    expiration: 12345678888,
    revocationOpts: {
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      id: rhsUrl,
    },
  }
}

module.exports = { tests }
