const { expect } = require("chai")
const {
  removeIndex,
  updateData,
  getIndex,
  addIndex,
  addData,
  getKey,
  addInd,
  _getIndex,
  addSingleIndex,
  removeSingleIndex,
  removeData,
} = require("../sdk/contracts/weavedb-kv/lib/index")
describe("WeaveDB Index", function () {
  this.timeout(0)
  let storage = {}
  const sw = {
    kv: {
      get: async key => storage[key] || null,
      put: async (key, val) => (storage[key] = val),
    },
  }
  let state = {}
  let db, Bob, Alis, Ben
  const ind = ["a", "b", "c"]
  const ind2 = ["d", "e", "f"]
  beforeEach(async () => {
    Bob = { name: "Bob", age: 3 }
    Alis = { name: "Alis", age: 4 }
    Ben = { name: "Ben", age: 3 }
    storage = {}
    state = { indexes: { col: ind, "col.doc.subcol": ind2 } }
    db = async id => {
      return {
        id1: { __data: Bob },
        id2: { __data: Alis },
        id3: { __data: Ben },
      }[id]
    }
  })
  it("getKey", async () => {
    expect(getKey(["col"], [["age"]])).to.eql("index.col//age/asc")
    expect(
      getKey(["col", "doc", "subcol"], [["age", "desc"], ["name"]])
    ).to.eql("index.col/doc/subcol//age/desc/name/asc")
  })

  it("add/remove SingleIndex", async () => {
    await addSingleIndex("id2", "age", Alis, db, ["col"], sw)
    await addSingleIndex("id1", "age", Bob, db, ["col"], sw)
    expect(storage["index.col//age/asc"]).to.eql(["id1", "id2"])
    await removeSingleIndex("id1", "age", ["col"], sw)
    expect(storage["index.col//age/asc"]).to.eql(["id2"])
  })

  it("add / remove Data", async () => {
    await addData("id2", Alis, db, ["col"], sw)
    await addData("id1", Bob, db, ["col"], sw)
    expect(storage["index.col//age/asc"]).to.eql(["id1", "id2"])
    expect(storage["index.col//name/asc"]).to.eql(["id2", "id1"])
    expect(storage["index.col//age/asc"]).to.eql(["id1", "id2"])
    await updateData("id2", { name: "Alice", age: 1 }, Alis, db, ["col"], sw)
    expect(storage["index.col//age/asc"]).to.eql(["id2", "id1"])
    await removeData("id1", db, ["col"], sw)
    expect(storage["index.col//age/asc"]).to.eql(["id2"])
  })

  it("getIndex", async () => {
    await addData("id2", Alis, db, ["col"], sw)
    await addData("id1", Bob, db, ["col"], sw)
    expect(await getIndex(["col"], sw)).to.eql([
      "__id__/asc",
      "name/asc",
      "age/asc",
    ])
  })

  it("add/update/remove Index", async () => {
    await addData("id2", Alis, db, ["col"], sw)
    await addData("id1", Bob, db, ["col"], sw)
    await addIndex([["age"], ["name"]], ["col"], db, sw)
    expect(await getIndex(["col"], sw)).to.eql([
      "__id__/asc",
      "name/asc",
      "age/asc",
      "age/asc/name/asc",
    ])
    await addData("id3", Ben, db, ["col"], sw)
    expect(storage["index.col//age/asc"]).to.eql(["id3", "id1", "id2"])
    await removeIndex([["age"], ["name"]], ["col"], sw)
    expect(await getIndex(["col"], sw)).to.eql([
      "__id__/asc",
      "name/asc",
      "age/asc",
    ])
  })
})
