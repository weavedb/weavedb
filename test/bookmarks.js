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
  let arlocal,
    wallet,
    walletAddress,
    wallet2,
    db,
    wallet3,
    wallet4,
    arweave_wallet
  this.timeout(0)

  before(async () => {
    db = await init()
  })

  after(async () => {
    await stop()
  })

  beforeEach(async () => {
    ;({ arweave_wallet, walletAddress, wallet, wallet2, wallet3, wallet4 } =
      await initBeforeEach(true))
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
    await db.setSchema(schema, "bookmarks", { ar: arweave_wallet })
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
    await db.setRules(rules, "bookmarks", { ar: arweave_wallet })
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
    await db.setRules(conf_rules, "conf", { ar: arweave_wallet })
    await db.setRules(conf_rules, "mirror", { ar: arweave_wallet })
    await db.setSchema(conf_schema, "conf", { ar: arweave_wallet })
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
      span: 60 * 60 * 12,
      do: true,
      jobs: [
        ["get", "conf", ["conf", "mirror-calc"], { ver: 0 }],
        ["get", "exists", ["mirror", ["ver"], ["ver", "!=", 0]]],
        ["let", "exists_map", ["indexBy", ["prop", "id"], { var: "exists" }]],
        ["let", "day", 60 * 60 * 24],
        ["let", "two_weeks", ["multiply", { var: "day" }, 14]],
        ["let", "now", { var: "block.timestamp" }],
        ["let", "deadline", ["subtract", { var: "now" }, { var: "two_weeks" }]],
        [
          "get",
          "bookmarks",
          ["bookmarks", ["date", "desc"], ["date", ">=", { var: "deadline" }]],
        ],
        ["let", "rank", {}],
        [
          "let",
          "batches",
          [
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
        ],
        [
          "do",
          [
            "forEach",
            [
              "pipe",
              ["let", "v"],
              ["prop", "article_id"],
              ["pair", "rank"],
              ["join", "."],
              ["let", "rank_path"],
              [
                "when",
                ["pipe", ["var", "$rank_path"], ["isNil"]],
                [
                  "pipe",
                  [
                    "applySpec",
                    {
                      id: ["identity"],
                      pt: ["always", 0],
                      bookmarks: ["always", 0],
                    },
                  ],
                  ["let", "$rank_path"],
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
                  "pipe",
                  ["applySpec", { pt: ["identity"], k: ["var", "k"] }],
                  ["values"],
                  ["sum"],
                ],
              ],
              ["let", "$rank_path"],
            ],
            { var: "bookmarks" },
          ],
        ],
        [
          "do",
          [
            "forEachObjIndexed",
            [
              "pipe",
              ["unapply", ["take", 2]],
              ["tap", ["pipe", ["head"], ["let", "v"]]],
              ["pipe", ["last"], ["let", "k"]],
              ["pair", "exists_map"],
              ["join", "."],
              ["let", "ex_path"],
              ["var", ["__"], true],
              [
                "when",
                ["pipe", ["isNil"], ["not"]],
                ["pipe", ["assoc", true, "exists"], ["let", "$ex_path"]],
              ],
              ["var", "v"],
              [
                "applySpec",
                {
                  method: ["always", "upsert"],
                  query: {
                    id: ["var", "k"],
                    ver: ["pipe", ["var", "conf"], ["prop", "ver"], ["inc"]],
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
        ],
        [
          "do",
          [
            "forEachObjIndexed",
            [
              "pipe",
              ["unapply", ["take", 2]],
              ["tap", ["pipe", ["head"], ["let", "v"]]],
              ["pipe", ["last"], ["let", "k"]],
            ],
            ["pair", "exists_map"],
            ["join", "."],
            ["var", ["__"], true],
            [
              "when",
              ["pipe", ["propEq", "exists", true], ["not"]],
              [
                "pipe",
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
                ["values"],
                [
                  "applySpec",
                  { query: ["identity"], batches: ["var", "batches"] },
                ],
                ["values"],
                ["apply", ["append"]],
                ["let", "batches"],
              ],
            ],
          ],
        ],
        ["batch", { var: "batches" }],
      ],
    }

    await db.addCron(cron, "count")
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
