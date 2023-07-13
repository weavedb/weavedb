const { expect } = require("chai")
const BPT = require("../sdk/contracts/weavedb-bpt/lib/BPT")
const { randO, shuffle, fuzztest } = require("./utils-bpt")
const { prop, range, sortWith, ascend, descend } = require("ramda")
const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
describe("B+Tree", function () {
  this.timeout(0)

  before(async () => {})

  beforeEach(async () => {})

  it("should build a tree with numbers [fuzz]", async () => {
    await fuzztest(range(0, 100), "number")
  })

  it("should build a tree with strings [fuzz]", async () => {
    await fuzztest(alpha.split(""), "string")
  })

  it("should build a tree with objects [fuzz]", async () => {
    let items = []
    let nums = range(0, 100)
    shuffle(nums)
    for (const i of range(0, 100)) {
      items.push({ str: randO(alpha), num: nums[i] })
    }
    await fuzztest(
      items,
      [
        ["str", "desc"],
        ["num", "asc"],
      ],
      sortWith([descend(prop("str")), ascend(prop("num"))])
    )
  })
})
