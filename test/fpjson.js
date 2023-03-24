const { expect } = require("chai")
const { init, stop, initBeforeEach } = require("./util")
describe("WeaveDB", function () {
  let db, arweave_wallet
  this.timeout(0)

  before(async () => {
    db = await init("web", 1, true)
  })

  after(async () => await stop())

  beforeEach(async () => {
    ;({ arweave_wallet } = await initBeforeEach())
  })

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })
  const cases = [
    {
      key: "Math A",
      tests: [
        [["inc", 0], 1],
        [["dec", 0], -1],
        [["negate", 1], -1],
      ],
    },
    {
      key: "Math B",
      tests: [
        [["add", 1, 2], 3],
        [["subtract", 2, 1], 1],
        [["multiply", 3, 2], 6],
        [["divide", 4, 2], 2],
        [["modulo", 4, 3], 1],
        [["mathMod", -3, 2], 1],
      ],
    },
    {
      key: "Math C",
      tests: [
        [["sum", [1, 2]], 3],
        [["product", [2, 1]], 2],
        [["mean", [1, 2, 3]], 2],
        [["median", [1, 2, 3]], 2],
      ],
    },
  ]

  for (const c of cases) {
    describe(c.key, function () {
      for (const v of c.tests) {
        it(`${
          typeof v[0][0] === "string" ? v[0][0] : v[0][0][0]
        }()`, async () => {
          const rules = {
            "let create": { "resource.newData.val": v[0] },
            "allow create": true,
          }
          await db.setRules(rules, "test", { ar: arweave_wallet })
          expect((await db.set({}, "test", "doc")).doc.val).to.eql(v[1])
        })
      }
    })
  }
})
