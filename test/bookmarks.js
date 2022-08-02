const Arweave = require("arweave")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const R = require("ramda")
const {
  forEach,
  pluck,
  isNil,
  range,
  indexBy,
  prop,
  compose,
  tap,
} = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")

describe("Bookmarks Example", function () {
  let arlocal, wallet, walletAddress, wallet2, db, wallet3, wallet4
  this.timeout(0)

  before(async () => {
    db = await init()
  })

  after(async () => {
    await stop()
  })

  beforeEach(async () => {
    ;({
      walletAddress,
      wallet,
      wallet2,
      wallet3,
      wallet4,
    } = await initBeforeEach(true))
  })

  const initDB = async () => {
    const schema = {
      type: "object",
      required: ["article_id", "date", "user_address"],
      properties: {
        article_id: {
          type: "string",
        },
        user_address: {
          type: "string",
        },
        date: {
          type: "number",
        },
      },
    }
    await db.setSchema(schema, "bookmarks")
    const rules = {
      let: {
        id: [
          "join",
          ":",
          [
            { var: "resource.newData.article_id" },
            { var: "resource.newData.user_address" },
          ],
        ],
      },
      "allow create": {
        and: [
          {
            "==": [{ var: "resource.id" }, { var: "id" }],
          },
          {
            "==": [
              { var: "request.auth.signer" },
              { var: "resource.newData.user_address" },
            ],
          },
          {
            "==": [
              { var: "request.block.timestamp" },
              { var: "resource.newData.date" },
            ],
          },
        ],
      },
      "allow delete": {
        "==": [
          { var: "request.auth.signer" },
          { var: "resource.data.user_address" },
        ],
      },
    }
    await db.setRules(rules, "bookmarks")
    const conf_rules = {
      "allow write": {
        in: [{ var: "request.auth.signer" }, [wallet.getAddressString(), true]],
      },
    }
    const conf_schema = {
      type: "object",
      required: ["ver"],
      properties: {
        ver: {
          type: "number",
        },
      },
    }
    await db.setRules(conf_rules, "conf")
    await db.setRules(conf_rules, "mirror")
    await db.setSchema(conf_schema, "conf")
  }

  const bookmark = async () => {
    const _bookmark = async (arr, wallet) => {
      let batches = []
      for (let v of arr) {
        batches.push([
          "set",
          {
            date: db.ts(),
            article_id: "article" + v,
            user_address: db.signer(),
          },
          "bookmarks",
          `${"article" + v}:${wallet.getAddressString()}`,
        ])
      }
      await db.batch(batches, { wallet })
    }
    await _bookmark([1, 2, 3, 4], wallet)
    await _bookmark([2, 3, 4], wallet2)
    await _bookmark([3, 4], wallet3)
    await _bookmark([4], wallet4)
  }

  const calc = async () => {
    const cron = {
      span: 1,
      jobs: [
        {
          op: "get",
          query: ["conf", "mirror-calc"],
          default: { ver: 0 },
          var: "conf",
        },
        {
          op: "get",
          query: ["mirror", ["ver"], ["ver", "!=", 0]],
          var: "exists",
        },
        {
          op: "let",
          var: "exists_map",
          code: ["indexBy", ["prop", "id"], { var: "exists" }],
        },
        { op: "let", var: "day", code: 60 * 60 * 24 },
        { op: "let", var: "two_weeks", code: ["multiply", { var: "day" }, 14] },
        { op: "let", var: "now", code: { var: "block.timestamp" } },
        {
          op: "let",
          var: "deadline",
          code: ["subtract", { var: "now" }, { var: "two_weeks" }],
        },
        {
          op: "get",
          var: "bookmarks",
          query: [
            "bookmarks",
            ["date", "desc"],
            ["date", ">=", { var: "deadline" }],
          ],
        },
        { op: "let", var: "rank", code: {} },
        {
          op: "let",
          var: "batches",
          code: [
            [
              "upsert",
              {
                ver: ["add", 1, ["prop", "ver", { var: "conf" }]],
                date: { var: "now" },
              },
              "conf",
              "mirror-calc",
            ],
          ],
        },
        {
          op: "do",
          code: [
            "forEach",
            [
              "pipe",
              ["tap", ["let", "v"]],
              ["prop", "article_id"],
              ["tap", ["let", "id"]],
              ["append", ["__"], ["rank"]],
              ["join", "."],
              ["tap", ["let", "rank_path"]],
              [
                "when",
                [
                  "compose",
                  ["isNil"],
                  ["var", ["__"], true],
                  ["var", "rank_path"],
                ],
                [
                  "compose",
                  ["let", "$rank_path"],
                  [
                    "applySpec",
                    {
                      id: ["identity"],
                      pt: ["always", 0],
                      bookmarks: ["always", 0],
                    },
                  ],
                ],
              ],
              ["var", "$rank_path"],
              ["over", ["lensProp", "bookmarks"], ["inc"]],
              ["let", "$rank_path"],
              ["var", "v"],
              ["prop", "date"],
              ["subtract", { var: "now" }],
              ["subtract", { var: "two_weeks" }],
              ["divide", ["__"], { var: "day" }],
              ["let", "k"],
              ["var", "$rank_path"],
              [
                "over",
                ["lensProp", "pt"],
                [
                  "compose",
                  ["sum"],
                  ["values"],
                  ["applySpec", { pt: ["identity"], k: ["var", "k"] }],
                ],
              ],
              ["let", "$rank_path"],
            ],
            { var: "bookmarks" },
          ],
        },
        {
          op: "do",
          code: [
            "forEachObjIndexed",
            [
              "pipe",
              ["unapply", ["take", 2]],
              ["tap", ["compose", ["let", "v"], ["head"]]],
              ["tap", ["compose", ["let", "k"], ["last"]]],
              ["var", "k"],
              ["append", ["__"], ["exists_map"]],
              ["join", "."],
              ["tap", ["let", "ex_path"]],
              ["var", ["__"], true],
              [
                "when",
                ["compose", ["not"], ["isNil"]],
                ["compose", ["let", "$ex_path"], ["assoc", true, "exists"]],
              ],
              ["var", "v"],
              [
                "applySpec",
                {
                  method: ["always", "upsert"],
                  query: {
                    id: ["var", "k"],
                    ver: ["compose", ["inc"], ["prop", "ver"], ["var", "conf"]],
                    pt: ["prop", "pt"],
                    bookmarks: ["prop", "bookmarks"],
                  },
                  collection: ["always", "mirror"],
                  doc: ["var", "k"],
                },
              ],
              ["values"],
              [
                "applySpec",
                { query: ["identity"], batches: ["var", "batches"] },
              ],
              ["values"],
              ["apply", ["append"]],
              ["let", "batches"],
            ],
            { var: "rank" },
          ],
        },
        {
          op: "do",
          code: [
            "forEachObjIndexed",
            [
              "pipe",
              ["unapply", ["take", 2]],
              ["tap", ["compose", ["let", "v"], ["head"]]],
              ["tap", ["compose", ["let", "k"], ["last"]]],
            ],
            ["var", "k"],
            ["append", ["__"], ["exists_map"]],
            ["join", "."],
            ["var", ["__"], true],
            [
              "when",
              ["compose", ["not"], ["propEq", "exists", true]],
              [
                "compose",
                ["tap", ["let", "batches"]],
                ["apply", ["append"]],
                ["values"],
                [
                  "applySpec",
                  { query: ["identity"], batches: ["var", "batches"] },
                ],
                ["values"],
                [
                  "applySpec",
                  {
                    method: ["always", "update"],
                    query: {
                      pt: ["always", db.del()],
                      ver: ["always", db.del()],
                    },
                    collection: ["always", "mirror"],
                    doc: ["var", "k"],
                  },
                ],
              ],
            ],
          ],
        },
        { op: "batch", query: { var: "batches" } },
      ],
    }

    await db.addCron(cron, "count")
    while (true) {
      await db.mineBlock()
      if ((await db.get("mirror")).length > 0) {
        break
      }
    }
  }

  it("should bookmark", async () => {
    await initDB()
    await bookmark()
    await calc()
    expect(pluck("id", await db.get("mirror", ["pt", "desc"], 10))).to.eql([
      "article4",
      "article3",
      "article2",
      "article1",
    ])
  })
})
