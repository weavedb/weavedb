import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { of, pof } from "../src/monade.js"
import weavedb from "../src/index.js"

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

describe("WeaveDB", () => {
  const msg = i => {
    return {
      from: "me",
      q: ["set", { name: "users-" + i }, 2, i.toString()],
    }
  }

  it("bare tps", async () => {
    let start = Date.now()
    let i = 0
    let obj = { env: {}, state: {} }
    const set = msg => obj => {
      const [op, ...rest] = msg.q
      const [data, dir, doc] = rest
      switch (op) {
        case "set":
          obj.state[dir] ??= {}
          obj.state[dir][doc] = data
          break
      }
    }
    while (Date.now() - start < 1000) set(msg(i++))(obj)
    console.log(i, "tps without monad")
  })

  it.only("bare monad", async () => {
    let start = Date.now()
    let i = 0
    const db2 = of({ env: {}, state: {} })
    while (Date.now() - start < 1000) {
      db2.map(obj => {
        const [op, ...rest] = msg(i++).q
        const [data, dir, doc] = rest
        switch (op) {
          case "set":
            obj.state[dir] ??= {}
            obj.state[dir][doc] = data
            break
        }
        return obj
      })
    }
    console.log(i, "tps with bare monad")
  })

  it.only("weavedb monad", async () => {
    let start = Date.now()
    let i = 0
    const db = weavedb()
      .init({ from: "me", id: "db" })
      .set({ from: "me", q: ["set", { name: "users" }, 0, "2"] })
    while (Date.now() - start < 1000) db.set(msg(i++))
    console.log(i, "tps with weavedb monad")
  })
})
