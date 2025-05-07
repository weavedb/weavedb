import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { of, pof } from "../src/monade.js"
import wdb from "../src/index.js"
import lsjson from "../src/lsjson.js"
import { open } from "lmdb"
import { resolve } from "path"
import BPT from "../src/bpt.js"
import { pluck, prop } from "ramda"
const wait = ms => new Promise(res => setTimeout(() => res(), ms))
const bob = { name: "Bob" }
const alice = { name: "Alice" }
const mike = { name: "Mike" }
const beth = { name: "Beth" }
const john = { name: "John" }

describe("Monade", () => {
  it("should create a monad", async () => {
    const res = await pof(2).map(async x => x + 1)
    assert.equal(await res.val(), 3)
    assert.equal(await res.to(v => v + 5), 8)
    const res2 = of(2).map(x => x + 1)
    assert.equal(res2.val(), 3)
  })

  it("should inject custom methods", async () => {
    const db = async obj =>
      await pof(obj, {
        to: {
          get: (x, y) => obj => {
            return obj.state.count + x + y
          },
        },
        map: {
          set: x => obj => {
            obj.state.count += x
            return obj
          },
        },
      })
    const wdb = await db({ env: {}, state: { count: 2 } })
    assert.deepEqual(await wdb.set(5).set(6).val(), {
      env: {},
      state: { count: 13 },
    })
    assert.equal(await wdb.get(9, 10), 32)
  })
})

describe("WeaveDB TPS", () => {
  const msg = i => {
    return {
      from: "me",
      q: ["set", { name: "users-" + i }, 2, i.toString()],
    }
  }

  const set = msg => obj => {
    const [op, ...rest] = msg.q
    const [data, dir, doc] = rest
    switch (op) {
      case "set":
        obj.state[dir] ??= {}
        obj.state[dir][doc] = data
        break
    }
    return obj
  }

  it("bare func tps (2.5-3M)", async () => {
    let start = Date.now()
    let i = 0
    let obj = { env: {}, state: {} }
    while (Date.now() - start < 1000) set(msg(i++))(obj)
    console.log(i, "tps without monad")
  })

  it("weavedb monad tps (2.5-3M)", async () => {
    const weavedb = obj => {
      obj ??= { env: {}, state: {} }
      return of(obj, { map: { set } })
    }
    const db = wdb()
    let start = Date.now()
    let i = 0
    while (Date.now() - start < 1000) db.set(msg(i++))
    console.log(i, "tps with weavedb monad")
  })

  it("bare monad tps (2.5-3M)", async () => {
    let start = Date.now()
    let i = 0
    const db = of({ env: {}, state: {} })
    while (Date.now() - start < 1000) db.map(obj => set(msg(i++))(obj))
    console.log(i, "tps with bare monad")
  })
})

describe("WeaveDB Core", () => {
  it("should init", async () => {
    const db = wdb().init({ from: "me", id: "db-1" })
    assert.equal(db.get(0, "0").name, "__dirs__")
  })

  it("should get/add/set/update/upsert/del", async () => {
    const kv = open({
      path: resolve(
        import.meta.dirname,
        `.db/weavedb-${Math.floor(Math.random() * 10000)}`,
      ),
    })
    const allow = [["allow()"]]
    const db = wdb(null, kv)
      .init({ from: "me", id: "db-1" })
      .set(
        "set",
        {
          name: "users",
          schema: { type: "object", required: ["name"] },
          auth: [["set:user,add:user,update:user,upsert:user,del:user", allow]],
        },
        0,
        "2",
      )
      .set("set:user", bob, 2, "bob")
      .set("set:user", alice, 2, "alice")
      .set("add:user", mike, 2)
      .set("add:user", beth, 2)
      .set("del:user", 2, "bob")
      .set("update:user", { age: 20 }, 2, "alice")
      .set("upsert:user", john, 2, "john")

    assert.deepEqual(db.get(2, "alice"), { ...alice, age: 20 })
    assert.deepEqual(db.get(2, "A"), mike)
    assert.deepEqual(db.get(2, "B"), beth)
    assert.deepEqual(db.get(2, "john"), john)
    await wait(0)
    const db2 = wdb(null, kv)
    assert.equal(db2.get(2, "bob"), null)
  })

  it("should persist data with lsJSON", async () => {
    const kv = open({
      path: resolve(
        import.meta.dirname,
        `.db/mydb-${Math.floor(Math.random() * 10000)}`,
      ),
    })
    /*
    const store = {}
    const kv = {
      get: k => store[k],
      put: async (k, v) => (store[k] = v),
    }*/
    let o = lsjson({}, { kv })
    o.users = {}
    o.users.bob = { name: "Bob" }
    o.users.bob.age = 5
    o.$commit()
    o.users.bob.age = 6
    o.$commit()
    o.users.bob.age = 7
    await wait(0)
    let o2 = lsjson({}, { kv })
    o.users.bob.age = 8
    o.$commit()
    assert.deepEqual(o.users, { bob: { name: "Bob", age: 8 } })
  })

  it.only("should build b+ tree", async () => {
    const store = {}
    const kv = {
      get: k => store[k],
      put: (k, v, nosave) => (store[k] = v),
      del: (k, v, nosave) => delete store[k],
    }
    let src = {
      bob: { name: "Bob", age: 3 },
      alice: { name: "Alice", age: 5 },
      mike: { name: "Mike", age: 3 },
      beth: { name: "Beth", age: 1 },
    }
    const data_src = key => ({ val: src[key], __id__: key.split("/").pop() })
    const bpt = new BPT({
      prefix: "users",
      kv,
      data_src,
      sort_fields: [
        ["age", "desc"],
        ["name", "desc"],
      ],
    })
    bpt.insert("bob")
    bpt.insert("alice")
    bpt.insert("mike")
    bpt.insert("beth")
    bpt.delete("beth")
    delete src.beth
    assert.deepEqual(pluck("key", bpt.range({})), ["alice", "mike", "bob"])
  })
})
