const { expect } = require("chai")
const BPT = require("../sdk/contracts/weavedb-bpt/lib/BPT")
const { testRanges, testInserts, isErr } = require("./utils-bpt")
const { sortBy, map, pluck, range } = require("ramda")
class KV {
  constructor() {
    this.store = {}
  }
  async get(key, _prefix = "") {
    return this.store[key]
  }
  async put(key, val, _prefix = "", nosave = false) {
    this.store[key] = val
  }
  async del(key, _prefix = "", nosave = false) {
    delete this.store[key]
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}
describe("B+Tree", function () {
  this.timeout(0)

  before(async () => {})

  beforeEach(async () => {})

  it("should build a tree with numbers [fuzz]", async () => {
    for (let v of range(0, 100)) {
      const order = Math.floor(Math.random() * 100) + 3
      const kv = new KV()
      const tree = new BPT(order, "number", kv)
      const count = Math.floor(Math.random() * 90) + 10
      let nums = range(0, 100)
      shuffle(nums)
      const sorted = sortBy(v => v)(nums.slice(0, count))
      let vals = map(v => [`key-${v}`, nums[v]])(range(0, count))
      await testInserts({ vals, order, tree })
      const tests = [
        [{ limit: 3, startAt: sorted[3] }, sorted.slice(3, 6)],
        [{ limit: 3, startAfter: sorted[3] }, sorted.slice(4, 7)],
        [{ startAfter: sorted[3], endAt: sorted[6] }, sorted.slice(4, 7)],
        [{ startAfter: sorted[3], endBefore: sorted[6] }, sorted.slice(4, 6)],
      ]
      await testRanges({ tree, vals: tests })
    }
  })
})
