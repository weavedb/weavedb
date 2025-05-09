import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { of, pof } from "../src/monade.js"
import wdb from "../src/index.js"
import { open } from "lmdb"
import { resolve } from "path"
import BPT from "../src/bpt.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import server from "../src/server.js"
import {
  put,
  mod,
  del,
  addIndex,
  getIndexes,
  removeIndex,
} from "../src/indexer.js"
import parseQuery from "../src/parser.js"
import { range, get, ranges, pranges, doc } from "../src/planner.js"
import { connect, createSigner } from "@permaweb/aoconnect"
import { AO, HB } from "wao"

import kv from "../src/kv.js"
const wait = ms => new Promise(res => setTimeout(() => res(), ms))
const bob = { name: "Bob" }
const alice = { name: "Alice" }
const mike = { name: "Mike" }
const beth = { name: "Beth" }
const john = { name: "John" }

const getKV = () => {
  const io = open({
    path: resolve(
      import.meta.dirname,
      `.db/mydb-${Math.floor(Math.random() * 10000)}`,
    ),
  })
  return kv(io, c => {})
}

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

  it("bare func tps (2.5 - 3.0 M)", async () => {
    let start = Date.now()
    let i = 0
    let obj = { env: {}, state: {} }
    while (Date.now() - start < 1000) set(msg(i++))(obj)
    console.log(i, "tps without monad")
  })

  it("full weavedb monad & kv tps (3.0 - 3.5 K)", async () => {
    const allow = [["allow()"]]
    const db = wdb(getKV())
      .init({ from: "me", id: "db-1" })
      .set(
        "set",
        {
          name: "users",
          schema: { type: "object", required: ["name"] },
          auth: [["set:user,add:user,update:user,upsert:user,del:user", allow]],
        },
        0,
        "3",
      )
    let start = Date.now()
    let last = 0
    let i = 0
    while (Date.now() - start < 1000) {
      db.set("set:user", { name: `Bob-${i}` }, 3, `bob-${i++}`)
    }
    console.log(i, "tps with weavedb monad & kv")
  })

  it("bare monad tps (2.5 - 3.0 M)", async () => {
    let start = Date.now()
    let i = 0
    const db = of({ env: {}, state: {} })
    while (Date.now() - start < 1000) db.map(obj => set(msg(i++))(obj))
    console.log(i, "tps with bare monad")
  })
})

describe("WeaveDB Core", () => {
  it("should init", async () => {
    const db = wdb(getKV()).init({ from: "me", id: "db-1" })
    assert.equal(db.get("0", "0").name, "__dirs__")
  })

  it("should get/add/set/update/upsert/del", async () => {
    const allow = [["allow()"]]
    const wkv = getKV()
    const db = wdb(wkv)
      .init({ from: "me", id: "db-1" })
      .set(
        "set",
        {
          name: "users",
          schema: { type: "object", required: ["name"] },
          auth: [["set:user,add:user,update:user,upsert:user,del:user", allow]],
        },
        0,
        "3",
      )
      .set("set:user", bob, 3, "bob")
      .set("set:user", alice, 3, "alice")
      .set("add:user", mike, 3)
      .set("add:user", beth, 3)
      .set("del:user", 3, "bob")
      .set("update:user", { age: 20 }, 3, "alice")
      .set("upsert:user", john, 3, "john")
    assert.deepEqual(db.get("3", "alice"), { ...alice, age: 20 })
    assert.deepEqual(db.get("3", "A"), mike)
    assert.deepEqual(db.get("3", "B"), beth)
    assert.deepEqual(db.get("3", "john"), john)
    await wait(100)

    // recover from kv
    const db2 = wdb(wkv)
    assert.equal(db2.get("3", "bob"), null)
    assert.deepEqual(db2.get("3", "alice"), { ...alice, age: 20 })
  })
  /*
  it.skip("should persist data with lsJSON", async () => {
    const kv = open({
      path: resolve(
        import.meta.dirname,
        `.db/mydb-${Math.floor(Math.random() * 10000)}`,
      ),
    })
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
  */
  it("should build b+ tree", async () => {
    let data = {
      bob: { name: "Bob", age: 3 },
      alice: { name: "Alice", age: 5 },
      mike: { name: "Mike", age: 3 },
      beth: { name: "Beth", age: 1 },
    }
    const store = {}
    const kv = {
      get: k => store[k],
      put: (k, v, nosave) => (store[k] = v),
      del: (k, v, nosave) => delete store[k],
      data: key => ({ val: data[key], __id__: key.split("/").pop() }),
    }

    const bpt = new BPT({
      prefix: "users",
      kv,
      sort_fields: [
        ["age", "desc"],
        ["name", "desc"],
      ],
    })
    bpt.insert("bob", data.bob)
    bpt.insert("alice", data.alice)
    bpt.insert("mike", data.mike)
    bpt.insert("beth", data.beth)
    bpt.delete("beth")
    delete data.beth
    assert.deepEqual(pluck("key", bpt.range({})), ["alice", "mike", "bob"])
  })
  it("should build add indexes", async () => {
    const data = {}
    const store = {}
    const kv = {
      get: k => store[k],
      put: (k, v, nosave) => (store[k] = v),
      del: (k, nosave) => delete store[k],
      data: key => ({ val: data[key], __id__: key.split("/").pop() }),
      putData: (key, val) => (data[key] = val),
      delData: key => delete data[key],
    }
    put({ ...bob, age: 3 }, "bob", ["users"], kv, true)
    put({ ...alice, age: 5 }, "alice", ["users"], kv, true)
    addIndex(
      [
        ["age", "desc"],
        ["name", "asc"],
      ],
      ["users"],
      kv,
    )
    put({ ...mike, age: 7 }, "mike", ["users"], kv, true)
    assert.deepEqual(store["age/asc/0"].vals, ["bob", "alice", "mike"])
    put({ ...bob, age: 10 }, "bob", ["users"], kv)
    assert.deepEqual(store["age/asc/0"].vals, ["alice", "mike", "bob"])
    put({ ...bob, age: 6 }, "bob", ["users"], kv)
    assert.deepEqual(store["age/asc/0"].vals, ["alice", "bob", "mike"])
    del("bob", ["users"], kv)
    assert.deepEqual(store["age/asc/0"].vals, ["alice", "mike"])
    assert.deepEqual(store["indexes"]["age/desc/name/asc"], {
      key: "age/desc/name/asc",
      order: 100,
    })
    removeIndex(
      [
        ["age", "desc"],
        ["name", "asc"],
      ],
      ["users"],
      kv,
    )
    assert.equal(store["indexes"]["age/desc/name/asc"] ?? null, null)
  })

  it("should parse query", async () => {
    const q = {
      path: ["users"],
      limit: 10,
      start: ["startAt", { name: "Bob" }],
      end: ["endBefore", { name: "Bob", age: 3 }],
      startCursor: null,
      endCursor: null,
      sort: [
        ["name", "asc"],
        ["age", "desc"],
      ],
      reverse: { start: false, end: true },
      array: ["favs", "array-contains", "apple"],
      equals: [["name", "==", "Bob"]],
      range: [["age", "<", 3]],
      sortByTail: false,
      queries: [
        {
          opt: {
            limit: 10,
            startAt: { name: "Bob" },
            endBefore: { name: "Bob", age: 3 },
          },
          prefix: "favs/array:701935c8d90e8c630a35a7ae824446bf",
        },
      ],
      type: "range",
    }
    assert.deepEqual(
      parseQuery([
        "users",
        ["age", "desc"],
        ["name", "==", "Bob"],
        ["favs", "array-contains", "apple"],
        ["age", "<", 3],
        10,
      ]),
      q,
    )
  })
  it("should query with planner", async () => {
    const data = {}
    const store = {}
    const kv = {
      get: k => store[k],
      put: (k, v, nosave) => (store[k] = v),
      del: (k, nosave) => delete store[k],
      data: key => ({ val: data[key], __id__: key.split("/").pop() }),
      putData: (key, val) => (data[key] = val),
      delData: key => delete data[key],
    }
    put({ ...bob, age: 3 }, "bob", ["users"], kv, true)
    put({ ...alice, age: 5 }, "alice", ["users"], kv, true)
    const parsed = parseQuery(["users", ["name", "==", "Bob"]])
    assert.deepEqual(get(parsed, kv), [
      {
        key: "bob",
        val: { name: "Bob", age: 3 },
      },
    ])
  })
})

describe("KV", () => {
  it("should save data to kv", async () => {
    const io = open({
      path: resolve(
        import.meta.dirname,
        `.db/mydb-${Math.floor(Math.random() * 10000)}`,
      ),
    })
    const wkv = kv(io, c => {})
    let start = Date.now()
    let last = 0
    let i = 0
    let s = {}
    while (Date.now() - start < 1000) {
      wkv.put(`bob-${i}`, { name: `Bob_${i++}` })
      if (i % 3 === 0) {
        if (i % 6 === 0) {
          wkv.reset()
        } else {
          wkv.commit().then(({ i, data }) => {})
        }
      }
    }
    console.log(i)
    assert.deepEqual(wkv.get("bob-1"), { name: "Bob_1" })
    const wkv2 = kv(io)
    await wait(5000)
    assert.deepEqual(wkv2.get("bob-1"), { name: "Bob_1" })
  })
})

describe("Server", () => {
  it.only("should run a server", async () => {
    const ao = new AO()
    const { jwk } = await ao.ar.gen()
    const hb = "http://localhost:10000"
    const { request: request_hb } = connect({
      MODE: "mainnet",
      URL: hb,
      device: "",
      signer: createSigner(jwk),
    })
    const txt = await fetch(`${hb}/~meta@1.0/info/serialize~json@1.0`).then(r =>
      r.json(),
    )
    const addr = txt.address
    const tags = {
      method: "POST",
      path: "/~process@1.0/schedule",
      scheduler: addr,
      "random-seed": Math.random().toString(),
    }
    const pid = (await request_hb(tags)).process
    console.log("pid", pid)
    const dbpath = resolve(
      import.meta.dirname,
      `.db/weavedb-${Math.floor(Math.random() * 10000)}`,
    )
    const node = server({ dbpath, jwk, hb, pid })
    const { request } = connect({
      MODE: "mainnet",
      URL: "http://localhost:4000",
      device: "",
      signer: createSigner(jwk),
    })
    const allow = [["allow()"]]
    let start = Date.now()
    const q1 = [
      "set",
      {
        name: "users",
        schema: { type: "object", required: ["name"] },
        auth: [["set:user,add:user,update:user,upsert:user,del:user", allow]],
      },
      0,
      "3",
    ]
    const res = await request({
      method: "POST",
      path: "/~weavedb@1.0/set",
      query: JSON.stringify(q1),
    })
    const json = JSON.parse(res.body)
    if (json.success) {
      console.log(Date.now() - start, "ms")
      console.log(json)
    }
    start = Date.now()
    const q2 = ["set:user", bob, 3, "bob"]
    const res2 = await request({
      method: "POST",
      path: "/~weavedb@1.0/set",
      query: JSON.stringify(q2),
    })
    const json2 = JSON.parse(res2.body)
    if (json2.success) {
      console.log(Date.now() - start, "ms")
      console.log(json2)
    } else {
      console.log(json2.error)
    }

    start = Date.now()
    const res3 = await request({
      method: "GET",
      path: "/~weavedb@1.0/get",
      query: JSON.stringify(["3"]),
    })
    const json3 = JSON.parse(res3.body)
    if (json3.success) {
      console.log(Date.now() - start, "ms")
      assert.deepEqual(json3.res, [bob])
    } else {
      console.log(json3.error)
    }
    await wait(1000)
    let params = `target=${pid}`
    let res4 = await fetch(
      `${hb}/~scheduler@1.0/schedule/serialize~json@1.0?${params}`,
    ).then(r => r.json())
    let i = 0
    let qs = [q1, q2]
    for (let k in res4.assignments ?? {}) {
      const m = res4.assignments[k]
      assert.equal(m.process, pid)
      if (m.body.data) {
        for (const v of JSON.parse(m.body.data)) {
          assert.deepEqual(JSON.parse(v.query), qs[i])
          i++
        }
      }
    }

    node.stop()
  })
})
