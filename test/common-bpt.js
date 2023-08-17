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
      await db.get("ppl", ["age"], ["weight", "desc"], ["age", "not-in", [30]])
    ).to.eql([Bob, John])
    // where != with sort
    expect(
      await db.get("ppl", ["age"], ["weight", "desc"], ["age", "!=", 30])
    ).to.eql([Bob, John])

    // where array-contains-any
    expect(
      await db.get("ppl", ["letters", "array-contains-any", ["j", "t"]])
    ).to.eql([Beth, John])

    // where array-contains-any with sort

    await db.addIndex(
      [["letters", "array"], ["age", "desc"], ["weight"]],
      "ppl",
      {
        ar: arweave_wallet,
      }
    )
    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["weight", "asc"],
        ["letters", "array-contains-any", ["j", "t", "a"]]
      )
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
        ["height", "==", 160]
      )
    ).to.eql([Alice])
    expect(
      await db.get(
        "ppl",
        ["height"],
        ["weight", "desc"],
        ["age", "==", 30],
        ["height", "==", 160]
      )
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
        ["weight", "desc"]
      )
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
      [Beth, John]
    )

    expect(
      await db.get("ppl", ["age", ">=", 20], ["startAfter", alice])
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
        ["startAfter", beth]
      )
    ).to.eql([Bob])

    // array-contains-any with cursor
    expect(
      await db.get(
        "ppl",
        ["letters", "array-contains-any", ["b", "j"]],
        ["startAfter", beth]
      )
    ).to.eql([Bob, John])

    // where in with cursor
    expect(
      await db.get("ppl", ["age", "in", [20, 30]], ["startAfter", alice])
    ).to.eql([Beth])

    // where not-in with cursor
    expect(
      await db.get(
        "ppl",
        ["age"],
        ["age", "not-in", [20, 30]],
        ["startAfter", john]
      )
    ).to.eql([])

    // where =! with cursor
    expect(
      await db.get("ppl", ["age"], ["age", "!=", 30], ["startAfter", bob])
    ).to.eql([John])

    // desc/reverse tests
    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", ">", 20],
        ["startAfter", john]
      )
    ).to.eql([Beth, Alice])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", ">=", 30],
        ["startAt", beth],
        ["endAt", beth]
      )
    ).to.eql([Beth])

    expect(
      await db.get("ppl", ["age", "desc"], ["age", "<", 40], ["startAt", alice])
    ).to.eql([Alice, Bob])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "<=", 40],
        ["startAfter", alice]
      )
    ).to.eql([Bob])
    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "<", 40],
        ["startAfter", alice]
      )
    ).to.eql([Bob])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", ">", 20],
        ["endBefore", alice]
      )
    ).to.eql([John, Beth])

    expect(
      await db.get("ppl", ["age", "desc"], ["age", ">=", 30], ["endAt", alice])
    ).to.eql([John, Beth, Alice])

    expect(
      await db.get("ppl", ["age", "desc"], ["age", "<", 40], ["endAt", bob])
    ).to.eql([Beth, Alice, Bob])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "<=", 40],
        ["endBefore", bob]
      )
    ).to.eql([John, Beth, Alice])

    // in with desc
    expect(await db.get("ppl", ["age", "asc"], ["age", "in", [40, 20]])).to.eql(
      [Bob, John]
    )
    expect(
      await db.get("ppl", ["age", "desc"], ["age", "in", [40, 20]])
    ).to.eql([John, Bob])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "in", [40, 20]],
        ["startAfter", john]
      )
    ).to.eql([Bob])
    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "in", [40, 20]],
        ["startAt", john],
        ["endBefore", bob]
      )
    ).to.eql([John])
    expect(await db.get("ppl", ["age", "not-in", [40, 20]])).to.eql([
      Alice,
      Beth,
    ])

    expect(
      await db.get("ppl", ["age", "desc"], ["age", "not-in", [40, 20]])
    ).to.eql([Beth, Alice])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "not-in", [40, 20]],
        ["startAfter", beth]
      )
    ).to.eql([Alice])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["age", "!=", 30],
        ["startAfter", john]
      )
    ).to.eql([Bob])

    await db.addIndex(
      [
        ["letters", "array"],
        ["age", "desc"],
      ],
      "ppl",
      {
        ar: arweave_wallet,
      }
    )

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["letters", "array-contains", "b"],
        ["age", "in", [20, 40]],
        ["startAt", bob]
      )
    ).to.eql([Bob])

    expect(
      await db.get(
        "ppl",
        ["age", "desc"],
        ["letters", "array-contains-any", ["b", "j"]],
        ["age", "in", [20, 40]],
        ["startAt", john]
      )
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

  "should set bundlers": async ({ db, walletAddress, arweave_wallet }) => {
    const bundlers = [walletAddress]
    await db.setBundlers(bundlers, { ar: arweave_wallet })
    expect(await db.getBundlers()).to.eql(bundlers)
    const tx = await db.bundle([await db.sign("add", {}, "ppl")])
    expect(tx.success).to.eql(true)
    const tx2 = await db.add({}, "ppl", { ar: arweave_wallet })
    expect(tx2.success).to.eql(false)

    await db.setBundlers(["0xabc"], { ar: arweave_wallet })
    const tx3 = await db.bundle([await db.sign("add", {}, "ppl")])
    expect(tx2.success).to.eql(false)
    return
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
      await db.get("ppl", ["favs", "array-contains", "food"], ["date", "desc"])
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
      on: "create",
      func: [
        ["get", "art", ["posts", { var: "data.after.aid" }]],
        [
          "let",
          "week",
          ["subtract", { var: "block.timestamp" }, 60 * 60 * 24 * 7],
        ],
        [
          "let",
          "new_pt",
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
          "update",
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
        times: 1,
        span: 1,
        jobs: [["update", [{ age: db.inc(1) }, "ppl", "Bob"]]],
      },
      "inc_age",
      {
        ar: arweave_wallet,
      }
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(2)

    await db.addCron(
      {
        do: true,
        times: 1,
        span: 1,
        jobs: [["break"], ["update", [{ age: db.inc(1) }, "ppl", "Bob"]]],
      },
      "inc_age",
      {
        ar: arweave_wallet,
      }
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(2)

    await db.addCron(
      {
        do: true,
        times: 1,
        span: 1,
        jobs: [["break"], ["update", [{ age: db.inc(1) }, "ppl", "Bob"]]],
      },
      "inc_age",
      {
        ar: arweave_wallet,
      }
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(2)

    await db.addCron(
      {
        do: true,
        times: 1,
        span: 1,
        jobs: [
          [
            "if",
            ["identity", false],
            ["update", [{ age: db.inc(1) }, "ppl", "Bob"]],
          ],
        ],
      },
      "inc_age",
      {
        ar: arweave_wallet,
      }
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(2)

    await db.addCron(
      {
        do: true,
        times: 1,
        span: 1,
        jobs: [
          [
            "if",
            ["identity", true],
            ["update", [{ age: db.inc(1) }, "ppl", "Bob"]],
          ],
        ],
      },
      "inc_age",
      {
        ar: arweave_wallet,
      }
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(3)

    await db.addCron(
      {
        do: true,
        times: 1,
        span: 1,
        jobs: [
          [
            "ifelse",
            ["identity", false],
            ["update", [{ age: db.inc(1) }, "ppl", "Bob"]],
            ["update", [{ age: db.inc(2) }, "ppl", "Bob"]],
          ],
        ],
      },
      "inc_age",
      {
        ar: arweave_wallet,
      }
    )
    expect((await db.get("ppl", "Bob")).age).to.eql(5)
  },
  "should tick.only": async ({ db, arweave_wallet }) => {
    await db.addCron(
      {
        span: 1,
        times: 2,
        jobs: [["get", "ppl", ["ppl"]]],
      },
      "ticker",
      {
        ar: arweave_wallet,
      }
    )
    let success = false
    while (true) {
      const tx = await db.tick()
      if (tx.success) {
        success = true
        break
      }
    }
    expect(success).to.eql(true)
  },
}

module.exports = { tests }
