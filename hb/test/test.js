import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { of, pof } from "../src/monade.js"
import wdb from "../src/index.js"

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
  it.only("should init", async () => {
    const db = wdb().init({ from: "me", id: "db-1" })
    assert.equal(db.get(0, "0").name, "__dirs__")
  })

  it.only("should get/add/set/update/upsert/del", async () => {
    const bob = { name: "Bob" }
    const alice = { name: "Alice" }
    const mike = { name: "Mike" }
    const beth = { name: "Beth" }
    const john = { name: "John" }

    const db = wdb()
      .init({ from: "me", id: "db-1" })
      .set(
        "set",
        {
          name: "users",
          schema: { type: "object", required: ["name"] },
        },
        0,
        "2",
      )
      .set("set", bob, 2, "bob")
      .set("set", alice, 2, "alice")
      .set("add", mike, 2)
      .set("add", beth, 2)
      .set("del", 2, "bob")
      .set("update", { age: 20 }, 2, "alice")
      .set("upsert", john, 2, "john")

    assert.deepEqual(db.get(2, "alice"), { ...alice, age: 20 })
    assert.deepEqual(db.get(2, "A"), mike)
    assert.deepEqual(db.get(2, "B"), beth)
    assert.deepEqual(db.get(2, "john"), john)
  })
})
