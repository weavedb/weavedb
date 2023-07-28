const { expect } = require("chai")
const { mergeLeft, pluck, isNil, compose, map, pick, dissoc } = require("ramda")
const { providers, Wallet } = require("ethers")
const { Ed25519KeyIdentity } = require("@dfinity/identity")
const _ii = [
  "302a300506032b6570032100ccd1d1f725fc35a681d8ef5d563a3c347829bf3f0fe822b4a4b004ee0224fc0d",
  "010925abb4cf8ccb7accbcfcbf0a6adf1bbdca12644694bb47afc7182a4ade66ccd1d1f725fc35a681d8ef5d563a3c347829bf3f0fe822b4a4b004ee0224fc0d",
]
const Account = require("intmax").Account
const EthCrypto = require("eth-crypto")
const EthWallet = require("ethereumjs-wallet").default
const { readFileSync } = require("fs")
const { resolve } = require("path")

const tests = {
  "should increment like count": async ({ db, arweave_wallet }) => {
    const aid = "aaa"
    const user = "abc"
    const trg = {
      key: "inc_like",
      on: "create",
      func: [
        ["update", [{ likes: db.inc(1) }, "posts", { var: `data.after.aid` }]],
      ],
    }
    await db.addTrigger(trg, "likes", { ar: arweave_wallet })
    const like = { date: Date.now(), user, aid }
    await db.set(
      { reposts: 0, likes: 0, comments: 0, owner: "a" },
      "posts",
      `${aid}`
    )
    await db.set(like, "likes", `${aid}:${user}`)

    expect((await db.get("posts", `${aid}`)).likes).to.eql(1)
    const trg2 = {
      key: "inc_reposts",
      on: "create",
      func: [
        ["let", "batches", []],
        [
          "do",
          [
            "unless",
            ["pathEq", ["after", "repost"], ""],
            [
              "pipe",
              ["var", "batches"],
              [
                "append",
                [
                  "[]",
                  "update",
                  { reposts: db.inc(1) },
                  "posts",
                  { var: "data.after.repost" },
                ],
              ],
              ["let", "batches"],
            ],
            { var: "data" },
          ],
        ],
        ["batch", { var: "batches" }],
      ],
    }
    await db.addTrigger(trg2, "posts", { ar: arweave_wallet })
    await db.set(
      { repost: "aaa", likes: 0, reposts: 0, comments: 0 },
      "posts",
      `bbb`
    )
    expect((await db.get("posts", `${aid}`)).reposts).to.eql(1)

    const trg3 = {
      key: "inc_comments",
      on: "create",
      func: [
        ["let", "batches", []],
        [
          "do",
          [
            "unless",
            ["pathEq", ["after", "reply_to"], ""],
            [
              "pipe",
              ["var", "batches"],
              [
                "append",
                [
                  "[]",
                  "update",
                  { comments: db.inc(1) },
                  "posts",
                  { var: "data.after.reply_to" },
                ],
              ],
              ["let", "batches"],
            ],
            { var: "data" },
          ],
        ],
        ["batch", { var: "batches" }],
      ],
    }
    await db.addTrigger(trg3, "posts", { ar: arweave_wallet })
    await db.set(
      { repost: "", reply_to: "aaa", likes: 0, reposts: 0, comments: 0 },
      "posts",
      `ccc`
    )
    expect((await db.get("posts", `${aid}`)).comments).to.eql(1)

    await db.set({ followers: 0, following: 0, name: "a" }, "users", "a")
    await db.set({ followers: 0, following: 0, name: "b" }, "users", "b")
    await db.set({ followers: 0, following: 0, name: "c" }, "users", "c")

    const trg4 = {
      key: "follow",
      on: "create",
      func: [
        [
          "update",
          [{ followers: db.inc(1) }, "users", { var: `data.after.to` }],
        ],
        [
          "update",
          [{ following: db.inc(1) }, "users", { var: `data.after.from` }],
        ],
      ],
    }
    await db.addTrigger(trg4, "follows", { ar: arweave_wallet })
    await db.set({ from: "c", to: "a" }, "follows", "c:a")
    expect((await db.get("users", "a")).followers).to.eql(1)
    expect((await db.get("users", "c")).following).to.eql(1)

    const trg5 = {
      key: "last",
      on: "create",
      func: [
        [
          "let",
          "aid",
          [
            "when",
            ["isEmpty"],
            ["always", { var: "data.after.repost" }],
            { var: "data.after.reply_to" },
          ],
        ],
        ["get", "post", ["posts", { var: "aid" }]],
        [
          "let",
          "docid",
          ["join", ":", [{ var: "data.after.owner" }, { var: "post.owner" }]],
        ],
        ["update", [{ last: db.ts() }, "follows", { var: "docid" }]],
      ],
    }
    await db.addTrigger(trg5, "posts", { ar: arweave_wallet })
    await db.set(
      {
        repost: "",
        reply_to: "aaa",
        reposts: 0,
        likes: 0,
        comments: 0,
        owner: "c",
      },
      "posts",
      "eee"
    )
    const trg6 = {
      key: "timeline",
      on: "create",
      func: [
        ["let", "batches", []],
        [
          "let",
          "aid",
          [
            "when",
            ["isEmpty"],
            ["always", { var: "data.after.id" }],
            { var: "data.after.repost" },
          ],
        ],
        [
          "let",
          "rid",
          ["when", ["isEmpty"], ["always", ""], { var: "data.after.repost" }],
        ],
        [
          "get",
          "followers",
          [
            "follows",
            ["to", "==", { var: "data.after.owner" }],
            ["last", "desc"],
          ],
        ],
        ["let", "to", ["pluck", "from", { var: "followers" }]],
        [
          "do",
          [
            "when",
            [
              "both",
              ["pathEq", ["after", "reply_to"], ""],
              [
                "compose",
                ["complement", ["isEmpty"]],
                ["always", { var: "to" }],
              ],
            ],
            [
              "pipe",
              ["var", "batches"],
              [
                "append",
                [
                  "[]",
                  "set",
                  {
                    rid: { var: "rid" },
                    aid: { var: "aid" },
                    date: { var: "data.after.date" },
                    broadcast: { var: "to" },
                  },
                  "timeline",
                  { var: "data.after.id" },
                ],
              ],
              ["let", "batches"],
            ],
            { var: "data" },
          ],
        ],
        ["batch", { var: "batches" }],
      ],
    }

    await db.addTrigger(trg6, "posts", { ar: arweave_wallet })
    await db.addIndex(
      [
        ["to", "asc"],
        ["last", "desc"],
      ],
      "follows",
      { ar: arweave_wallet }
    )
    await db.set(
      {
        repost: "aaa",
        reply_to: "",
        reposts: 0,
        likes: 0,
        comments: 0,
        owner: "a",
        id: "repto",
        date: db.ts(),
      },
      "posts",
      `ddd`
    )
    console.log(await db.get("timeline"))
  },
}

module.exports = (it, its, local = {}) => {
  const _tests = mergeLeft(local, tests)
  for (const k in mergeLeft(local, _tests)) {
    const [name, type] = k.split(".")
    ;(isNil(type) ? it : it[type])(name, async () => _tests[k](its()))
  }
}
