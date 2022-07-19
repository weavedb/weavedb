const Arweave = require("arweave")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const { pluck, isNil, range, indexBy, prop } = require("ramda")
const {
  init,
  initBeforeEach,
  addFunds,
  mineBlock,
  query,
  get,
  getSchema,
  getRules,
  getIds,
  getNonce,
} = require("../test/util")

const op = {
  signer: () => ({ __op: "signer" }),
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
    await query(wallet, "setSchema", [schema, "bookmarks"])
    const rules = {
      "allow create": {
        and: [
          { "!=": [{ var: "request.auth.signer" }, null] },
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
        "!=": [
          { var: "request.auth.signer" },
          { var: "resource.newData.user_address" },
        ],
      },
    }
    await query(wallet, "setRules", [rules, "bookmarks"])
    const conf_rules = {
      "allow write": {
        "==": [{ var: "request.auth.signer" }, wallet.getAddressString()],
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
    await query(wallet, "setRules", [conf_rules, "conf"])
    await query(wallet, "setRules", [conf_rules, "mirror"])
  }

  const bookmark = async () => {
    let batches = []
    let ids = [1, 2, 3, 4, 2, 3, 4, 3, 4, 4]
    for (let i of range(0, 10)) {
      batches.push([
        "add",
        {
          date: op.ts(),
          article_id: "article" + ids[i],
          user_address: op.signer(),
        },
        "bookmarks",
      ])
    }
    await query(wallet, "batch", batches)
  }

  const calc = async () => {
    const conf = (await get(["conf", "mirror-calc"])) || { ver: 0 }
    const ex = (await get(["mirror", ["ver"], ["ver", "!=", 0]])) || []
    let emap = indexBy(prop("id"))(ex)
    const day = 60 * 60 * 24
    const two_weeks = day * 14
    const d = Date.now() / 1000
    const date = Date.now() / 1000 - two_weeks
    const bookmarks = await get([
      "bookmarks",
      ["date", "desc"],
      ["date", ">=", date],
    ])
    const rank = {}
    let batches = [
      [
        "upsert",
        { ver: conf.ver + 1, date: Date.now() },
        "conf",
        "mirror-calc",
      ],
    ]
    for (let v of bookmarks) {
      if (isNil(rank[v.article_id])) {
        rank[v.article_id] = {
          id: v.article_id,
          pt: 0,
          bookmarks: 0,
        }
      }
      rank[v.article_id].bookmarks += 1
      const k = (two_weeks - (d - v.date)) / day
      rank[v.article_id].pt += k
    }
    for (let k in rank) {
      let v = rank[k]
      if (!isNil(emap[k])) {
        emap[k].ex = true
      }
      batches.push([
        "upsert",
        {
          id: k,
          ver: conf.ver + 1,
          pt: v.pt,
          bookmarks: v.bookmarks,
        },
        "mirror",
        k,
      ])
    }
    for (let k in emap) {
      if (emap[k].ex !== true) {
        batches.push(["update", { pt: op.del(), ver: op.del() }, "mirror", k])
      }
    }
    await query(wallet, "batch", batches)
  }

  it("should bookmark", async () => {
    await initDB()
    await bookmark()
    await calc()
    /*
    expect(pluck("id", await get(["mirror", ["pt", "desc"], 10]))).to.eql([
      "article4",
      "article3",
      "article2",
      "article1",
    ])*/
  })
})
