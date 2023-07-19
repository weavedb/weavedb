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
  mod,
  pranges,
} = require("../sdk/contracts/weavedb-bpt/lib/index")
const { randO, shuffle, fuzztest } = require("./utils-bpt")
const {
  map,
  path,
  init,
  pluck,
  prop,
  range,
  sortWith,
  ascend,
  descend,
  o,
  compose,
  join,
  flatten,
  isNil,
} = require("ramda")
const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

describe("B+Tree", function () {
  let kvs, SW, temp
  this.timeout(0)

  before(async () => {})

  beforeEach(async () => {
    kvs = {}
    SW = {
      kv: {
        get: key => kvs[key],
        put: (key, val) => {
          kvs[key] = val
        },
      },
    }
    temp = {}
  })

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

  it("should build a collection", async () => {
    const opt = [["ppl"], temp, SW, "0x"]
    const Bob = { name: "Bob", age: 3, favs: ["apple"] }
    await put(Bob, "Bob", ...opt)
    await put({ name: "Alice", age: 6, favs: ["orange"] }, "Alice", ...opt)
    await put({ name: "Beth", age: 5, favs: ["grapes"] }, "Beth", ...opt)
    expect(
      pluck("key", await _range([["age", "asc"]], {}, ...init(opt)))
    ).to.eql(["Bob", "Beth", "Alice"])
    expect(
      pluck(
        "key",
        await _range([["age", "asc"]], { reverse: true }, ...init(opt))
      )
    ).to.eql(["Alice", "Beth", "Bob"])
    expect(
      pluck(
        "key",
        await _range(
          [["age", "asc"]],
          { limit: 2, reverse: true },
          ...init(opt)
        )
      )
    ).to.eql(["Alice", "Beth"])
    expect(
      pluck(
        "key",
        await _range(
          [["age", "asc"]],
          { reverse: true, startAt: { age: 3 } },
          ...init(opt)
        )
      )
    ).to.eql(["Bob"])
    expect(
      pluck(
        "key",
        await _range(
          [["name", "asc"]],
          { reverse: true, startAfter: { name: "Bob" } },
          ...init(opt)
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
          ...init(opt)
        )
      )
    ).to.eql(["Beth"])
    expect((await get("Bob", ...opt)).val).to.eql(Bob)
    await del("Bob", ...opt)
    expect(
      pluck(
        "key",
        await _range([["age", "asc"]], { reverse: true }, ...init(opt))
      )
    ).to.eql(["Alice", "Beth"])
    expect(
      pluck(
        "key",
        await _range([["__id__", "asc"]], { reverse: true }, ...init(opt))
      )
    ).to.eql(["Beth", "Alice"])
    await del("Bob", ...opt)
    await put(
      {
        name: "Alice",
        age: 5,
        favs: ["orange", "apple", "grapes"],
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
    expect(
      isNil((await getIndexes(["ppl"], temp, SW))["age/desc/name/desc"])
    ).to.eql(false)
    expect(pluck("key")(await _range(sorter, {}, ...init(opt)))).to.eql([
      "Beth",
      "Alice",
    ])
    await removeIndex(sorter, ...opt)
    expect(
      isNil((await getIndexes(["ppl"], temp, SW))["age/desc/name/desc"])
    ).to.eql(true)
  })

  it("should return mod stats", async () => {
    const prev = { test: 1, test2: 2, fav2: [1, 2], fav3: 3, fav4: [3] }
    const next = {
      test2: 3,
      test3: 3,
      fav: [1, 2],
      fav2: [2, 3],
      fav3: [3],
      fav4: 3,
    }
    const { dels, changes, news } = mod(prev, next)
    expect(dels).to.eql([
      "test",
      "fav2/array:c4ca4238a0b923820dcc509a6f75849b",
      "fav4/array:eccbc87e4b5ce2fe28308fd9f2a7baf3",
    ])
    expect(changes).to.eql(["test2", "fav2", "fav3", "fav4"])
    expect(news).to.eql([
      "fav2/array:eccbc87e4b5ce2fe28308fd9f2a7baf3",
      "fav3/array:eccbc87e4b5ce2fe28308fd9f2a7baf3",
      "test3",
      "fav",
      "fav/array:c4ca4238a0b923820dcc509a6f75849b",
      "fav/array:c81e728d9d4c2f636f067f89cc14862c",
    ])
  })

  it("should pagenate", async () => {
    const opt = [["ppl"], temp, SW, "0x"]
    const sorter = [["age", "asc"]]
    await put({ name: "Bob", age: 5 }, "Bob", ...opt)
    await put({ name: "Alice", age: 6 }, "Alice", ...opt)
    await put({ name: "Beth", age: 6 }, "Beth", ...opt)
    await put({ name: "Mike", age: 7 }, "Mike", ...opt)
    expect(
      pluck(
        "key",
        await _range(
          sorter,
          { startAt: { age: 6, __id__: "Alico" } },
          ...init(opt)
        )
      )
    ).to.eql(["Beth", "Mike"])
  })

  it("should return a range cursor", async () => {
    const opt = [["ppl"], temp, SW, "0x"]
    const sorter = [["age", "asc"]]
    for (let i of range(0, 200)) {
      await put({ name: "Bob", age: i }, `Bob-${i}`, ...opt)
    }
    const cursor = await _range(sorter, {}, ...init(opt), true)
    for (let i of range(0, 101)) {
      expect((await cursor()).key).to.eql(`Bob-${i}`)
    }

    const rcursor = await _range(sorter, { reverse: true }, ...init(opt), true)
    for (let i of range(0, 101)) {
      expect((await rcursor()).key).to.eql(`Bob-${199 - i}`)
    }
  })

  it("should execute parallel ranges", async () => {
    const opt = [["ppl"], temp, SW, "0x"]
    const opt2 = [["ppl2"], temp, SW, "0x"]
    const opt3 = [["ppl3"], temp, SW, "0x"]
    const sorter = [["age", "asc"]]
    let opts = [opt, opt2, opt3]
    for (let i of range(0, 10)) {
      shuffle(opts)
      await put({ age: i * 3 }, `Bob-${i * 3}`, ...opts[0])
      await put({ age: i * 3 + 1 }, `Bob-${i * 3 + 1}`, ...opts[1])
      await put({ age: i * 3 + 2 }, `Bob-${i * 3 + 2}`, ...opts[2])
    }
    const prefix = `${compose(join("/"), flatten)(sorter)}`
    expect(
      o(
        pluck("age"),
        pluck("val")
      )(
        await pranges(
          [
            { opt: {}, sort: sorter, path: ["ppl"], prefix },
            { opt: {}, sort: sorter, path: ["ppl2"], prefix },
            { opt: {}, sort: sorter, path: ["ppl3"], prefix },
          ],
          10,
          temp,
          SW
        )
      )
    ).to.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it("should add object indexes", async () => {
    const opt = [["ppl"], temp, SW, "0x"]
    await put({ name: "Bob", stats: { age: 5 } }, "Bob", ...opt)
    await put({ name: "Alice", stats: { age: 7 } }, "Alice", ...opt)
    await put({ name: "Beth", stats: { age: 6 } }, "Beth", ...opt)
    await addIndex([["stats.age", "asc"]], ...opt)
    expect(
      map(path(["val", "stats", "age"]))(
        await _range([["stats.age", "asc"]], { reverse: true }, ...init(opt))
      )
    ).to.eql([7, 6, 5])
    await put({ name: "Mike", stats: { age: 4 } }, "Mike", ...opt)
    expect(
      map(path(["val", "stats", "age"]))(
        await _range([["stats.age", "asc"]], { reverse: true }, ...init(opt))
      )
    ).to.eql([7, 6, 5, 4])
    await put({ name: "Mike", stats: { age: 8 } }, "Mike", ...opt)
    expect(
      map(path(["val", "stats", "age"]))(
        await _range([["stats.age", "asc"]], { reverse: true }, ...init(opt))
      )
    ).to.eql([8, 7, 6, 5])
    await put({ name: "John" }, "John", ...opt)
    expect(
      map(path(["val", "stats", "age"]))(
        await _range([["stats.age", "asc"]], { reverse: true }, ...init(opt))
      )
    ).to.eql([8, 7, 6, 5])
    await put({ name: "John", stats: { age: 9 } }, "John", ...opt)
    expect(
      map(path(["val", "stats", "age"]))(
        await _range([["stats.age", "asc"]], { reverse: true }, ...init(opt))
      )
    ).to.eql([9, 8, 7, 6, 5])
    await put({ name: "Mike", stats: {} }, "Mike", ...opt)
    expect(
      map(path(["val", "stats", "age"]))(
        await _range([["stats.age", "asc"]], { reverse: true }, ...init(opt))
      )
    ).to.eql([9, 7, 6, 5])
    await removeIndex([["stats.age", "asc"]], ...opt)
  })
})
