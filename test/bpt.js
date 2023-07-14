const { expect } = require("chai")
const BPT = require("../sdk/contracts/weavedb-bpt/lib/BPT")
const {
  get,
  put,
  del,
  range: _range,
  addIndex,
  removeIndex,
  getIndexes,
} = require("../sdk/contracts/weavedb-bpt/lib/Collection2")
const { randO, shuffle, fuzztest } = require("./utils-bpt")
const { pluck, prop, range, sortWith, ascend, descend } = require("ramda")
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

  it.only("should build a collection", async () => {
    let kvs = {}
    let SW = {
      kv: {
        get: key => kvs[key],
        put: (key, val) => {
          kvs[key] = val
        },
      },
    }
    let temp = {}
    const opt = [["ppl"], temp, SW, "0x"]
    const Bob = { name: "Bob", age: 3, favs: ["apple"] }
    await put(Bob, "Bob", ...opt)
    await put({ name: "Alice", age: 6, favs: ["orange"] }, "Alice", ...opt)
    await put({ name: "Beth", age: 5, favs: ["grapes"] }, "Beth", ...opt)
    expect(pluck("key", await _range([["age", "asc"]], {}, ...opt))).to.eql([
      "Bob",
      "Beth",
      "Alice",
    ])
    expect(
      pluck("key", await _range([["age", "asc"]], { reverse: true }, ...opt))
    ).to.eql(["Alice", "Beth", "Bob"])
    expect(
      pluck(
        "key",
        await _range([["age", "asc"]], { limit: 2, reverse: true }, ...opt)
      )
    ).to.eql(["Alice", "Beth"])
    expect(
      pluck(
        "key",
        await _range(
          [["age", "asc"]],
          { reverse: true, startAt: { age: 3 } },
          ...opt
        )
      )
    ).to.eql(["Bob"])
    expect(
      pluck(
        "key",
        await _range(
          [["name", "asc"]],
          { reverse: true, startAfter: { name: "Bob" } },
          ...opt
        )
      )
    ).to.eql(["Beth", "Alice"])
    expect(
      pluck(
        "key",
        await _range(
          [["name", "asc"]],
          {
            reverse: true,
            startAfter: { name: "Bob" },
            endBefore: { name: "Alice" },
          },
          ...opt
        )
      )
    ).to.eql(["Beth"])
    expect((await get("Bob", ...opt)).val).to.eql(Bob)
    await del("Bob", ...opt)
    expect(
      pluck("key", await _range([["age", "asc"]], { reverse: true }, ...opt))
    ).to.eql(["Alice", "Beth"])
    expect(
      pluck("key", await _range([["__id__", "asc"]], { reverse: true }, ...opt))
    ).to.eql(["Beth", "Alice"])
    await del("Bob", ...opt)
    await put(
      {
        age: { __op: "inc", n: -1 },
        favs: { __op: "arrayUnion", arr: ["apple", "grapes"] },
      },
      "Alice",
      ...opt
    )
    expect((await get("Alice", ...opt)).val).to.eql({
      name: "Alice",
      age: 5,
      favs: ["orange", "apple", "grapes"],
    })
    const sorter = [
      ["age", "desc"],
      ["name", "desc"],
    ]

    await addIndex(sorter, ...opt)
    expect(pluck("key")(await _range(sorter, {}, ...opt))).to.eql([
      "Beth",
      "Alice",
    ])

    await removeIndex(sorter, ...opt)
    expect(pluck("key")(await _range(sorter, {}, ...opt))).to.eql([])
  })
})
