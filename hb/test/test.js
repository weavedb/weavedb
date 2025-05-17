import assert from "assert"
import { createPrivateKey } from "node:crypto"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { of, pof, fn, pfn } from "../src/monade.js"
import wdb from "../src/index.js"
import queue from "../src/queue.js"
import { open } from "lmdb"
import { resolve } from "path"
import BPT from "../src/bpt.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import server from "../src/server.js"
import recover from "../src/recover.js"
import validate from "../src/validate.js"
import zkjson from "../src/zkjson.js"
import { spawn } from "child_process"
import {
  get,
  set,
  bob,
  alice,
  mike,
  beth,
  john,
  wait,
  genDir,
  init_query,
  users_query,
  HB as HBeam,
} from "./test-utils.js"

import {
  put,
  mod,
  del,
  addIndex,
  getIndexes,
  removeIndex,
} from "../src/indexer.js"
import parseQuery from "../src/parser.js"
import {
  range,
  get as planner_get,
  ranges,
  pranges,
  doc,
} from "../src/planner.js"

import { connect, createSigner } from "@permaweb/aoconnect"
import { AO, HB } from "wao"
import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"
import kv from "../src/kv.js"
class sign {
  constructor({ jwk, id }) {
    this.jwk = jwk
    this.id = id
    this.nonce = 0
    this.signer = createHttpSigner(
      createPrivateKey({ key: jwk, format: "jwk" }),
      "rsa-pss-sha512",
      jwk.n,
    )
  }
  async sign(...query) {
    const msg = await httpbis.signMessage(
      { key: this.signer, fields: ["query", "nonce", "id"] },
      {
        headers: {
          query: JSON.stringify(query),
          nonce: Number(++this.nonce).toString(),
          id: this.id,
        },
      },
    )
    return [
      ...query,
      {
        id: this.id,
        nonce: Number(this.nonce).toString(),
        signature: msg.headers.Signature,
        "signature-input": msg.headers["Signature-Input"],
      },
    ]
  }
}

const getKV = () => {
  const io = open({ path: genDir() })
  return kv(io, c => {})
}

describe("Monade", () => {
  it("should create a kleisli", async () => {
    const p1 = fn().map(n => n + 1)
    const p2 = pfn().map(async n => n + 2)
    const p3 = pfn().chain(p1).chain(p2)
    const f = pfn()
      .chain(p1)
      .map(n => n * 10)
      .chain(p3)
    assert.equal(
      await pof(3)
        .chain(f)
        .map(n => n * 3)
        .val(),
      129,
    )
  })
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
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const allow = [["allow()"]]
    const db = wdb(getKV())
      .set(...(await s.sign("init", init_query)))
      .set(...(await s.sign(...users_query)))
    let last = 0
    let i = 0
    let qs = []
    while (i < 5000) {
      qs.push(
        await s.sign("set:user", { name: `Bob-${i}` }, "users", `bob-${i++}`),
      )
    }
    let start = Date.now()
    i = 0
    while (Date.now() - start < 1000) {
      db.set(...qs[i++])
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
  it("should cget and pagenate", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const wkv = getKV()
    const db = wdb(wkv)
      .set(...(await s.sign("init", init_query)))
      .set(...(await s.sign(...users_query)))
      .set(...(await s.sign("set:user", bob, "users", "bob")))
      .set(...(await s.sign("set:user", alice, "users", "alice")))
    const cur = db.cget("users", 1)[0]
    assert.deepEqual(db.get("users", ["startAfter", cur]), [bob])
  })

  it("should handle queue", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const db = queue(wdb(getKV()))
    await db.set(...(await s.sign("init", init_query)))
    await db.set(...(await s.sign(...users_query)))
    await db.set(
      ...(await s.sign("set:user", { name: "Bob", age: 4 }, "users", "bob")),
    )
    assert.deepEqual(db.get("users"), [{ name: "Bob", age: 4 }])
    await db.set(...(await s.sign("set:user", alice, "users", "alice")))
    assert.deepEqual(db.get("users"), [alice, { name: "Bob", age: 4 }])
  })

  it("should init", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const db = wdb(getKV()).set(...(await s.sign("init", init_query)))
    assert.equal(db.get("_", "_").index, 0)
  })
  it("should add dirs", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const db = wdb(getKV())
      .set(...(await s.sign("init", init_query)))
      .set(...(await s.sign(...users_query)))
  })
  it("should update with _$ operators", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const wkv = getKV()
    const db = wdb(wkv)
      .set(...(await s.sign("init", init_query)))
      .set(...(await s.sign(...users_query)))
      .set(
        ...(await s.sign("set:user", { name: "Bob", age: 4 }, "users", "bob")),
      )
      .set(
        ...(await s.sign(
          "update:user",
          { age: { _$: ["inc"] } },
          "users",
          "bob",
        )),
      )
    assert.equal(db.get("users", "bob").age, 5)
  })

  it("should batch", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const wkv = getKV()
    const db = wdb(wkv)
      .set(...(await s.sign("init", init_query)))
      .set(...(await s.sign(...users_query)))
      .set(
        ...(await s.sign("batch", [
          ["set:user", bob, "users", "bob"],
          ["set:user", alice, "users", "alice"],
          ["update:user", { name: "Bobby" }, "users", "bob"],
        ])),
      )
    assert.deepEqual(db.get("users"), [alice, { name: "Bobby" }])
  })

  it("should add/remove indexes", async () => {
    const bob = { name: "Bbb", age: 20, favs: ["apple", "orange", "grape"] }
    const alice = { name: "Alice", age: 30, favs: ["apple", "peach"] }
    const mike = { name: "Mike", age: 40, favs: ["lemmon", "peach"] }
    const beth = { name: "Beth", age: 50, favs: ["peach", "kiwi"] }
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const wkv = getKV()
    const db = wdb(wkv)
      .set(...(await s.sign("init", init_query)))
      .set(...(await s.sign(...users_query)))
      .set(
        ...(await s.sign("batch", [
          ["set:user", bob, "users", "bob"],
          ["set:user", alice, "users", "alice"],
          ["set:user", mike, "users", "mike"],
          ["set:user", beth, "users", "beth"],
        ])),
      )
      .set(
        ...(await s.sign(
          "addIndex",
          [
            ["age", "desc"],
            ["name", "asc"],
          ],
          "users",
        )),
      )
    assert.deepEqual(db.get("users", ["age", "desc"], ["name"]), [
      beth,
      mike,
      alice,
      bob,
    ])
    assert.deepEqual(db.get("users", ["favs", "array-contains", "peach"]), [
      alice,
      beth,
      mike,
    ])
    db.set(
      ...(await s.sign("batch", [
        ["update:user", { age: 60 }, "users", "bob"],
      ])),
    )
    assert.deepEqual(db.get("users", ["age", "desc"], ["name"]), [
      { ...bob, age: 60 },
      beth,
      mike,
      alice,
    ])
  })

  it("should get/add/set/update/upsert/del", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const wkv = getKV()
    const db = wdb(wkv)
      .set(...(await s.sign("init", init_query)))
      .set(...(await s.sign(...users_query)))
      .set(...(await s.sign("set:user", bob, "users", "bob")))
      .set(...(await s.sign("set:user", alice, "users", "alice")))
      .set(...(await s.sign("add:user", mike, "users")))
      .set(...(await s.sign("add:user", beth, "users")))
      .set(...(await s.sign("del:user", "users", "bob")))
      .set(...(await s.sign("update:user", { age: 20 }, "users", "alice")))
      .set(...(await s.sign("upsert:user", john, "users", "john")))
    assert.deepEqual(db.get("users", "alice"), { ...alice, age: 20 })
    assert.deepEqual(db.get("users", "A"), mike)
    assert.deepEqual(db.get("users", "B"), beth)
    assert.deepEqual(db.get("users", "john"), john)
    await wait(100)

    // recover from kv
    const db2 = wdb(wkv)
    assert.equal(db2.get("users", "bob"), null)
    assert.deepEqual(db2.get("users", "alice"), { ...alice, age: 20 })
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
    assert.deepEqual(planner_get(parsed, kv), [
      { key: "bob", val: { name: "Bob", age: 3 } },
    ])
  })
})

describe("KV", () => {
  it("should save data to kv", async () => {
    const io = open({ path: genDir() })
    const wkv = kv(io, c => {})
    let start = Date.now()
    let last = 0
    let i = 0
    let s = {}
    while (Date.now() - start < 1000) {
      wkv.put(`bob-${i}`, { name: `Bob_${i++}` })
      if (i % 3 === 0) {
        if (i % 6 === 0) wkv.reset()
        else wkv.commit().then(({ i, data }) => {})
      }
    }
    console.log(i)
    assert.deepEqual(wkv.get("bob-1"), { name: "Bob_1" })
    const wkv2 = kv(io)
    await wait(5000)
    assert.deepEqual(wkv2.get("bob-1"), { name: "Bob_1" })
  })
})

const deploy = async ({ hb, tags }) => {
  const { jwk, addr } = await new AO().ar.gen()
  const signer = createSigner(jwk)
  const { request } = connect({ MODE: "mainnet", URL: hb, device: "", signer })
  const address = (
    await fetch(`${hb}/~meta@1.0/info/serialize~json@1.0`).then(r => r.json())
  ).address
  const _tags = {
    method: "POST",
    path: "/~process@1.0/schedule",
    scheduler: address,
    "random-seed": Math.random().toString(),
    ...tags,
  }
  const dbpath = genDir()
  const res = await request(_tags)
  return { pid: res.process, address, addr, jwk, signer, dbpath }
}

const q1 = users_query
const q2 = ["set:user", bob, "users", "bob"]
const q3 = ["set:user", alice, "users", "alice"]
let qs = [q1, q2]

const runHB = port => {
  const env = {
    //DIAGNOSTIC: "1",
    CMAKE_POLICY_VERSION_MINIMUM: "3.5",
    CC: "gcc-12",
    CXX: "g++-12",
  }
  return new HBeam({ cwd: "../../HyperBEAM", env, port })
}

describe("Server", () => {
  it("should connect with a remote server", async () => {
    const hb = "http://localhost:10000"
    const URL = "http://localhost:4000"

    const { pid, signer, jwk, addr, dbpath } = await deploy({ hb })
    console.log("pid", pid)
    console.log("addr", addr)
    const { request } = connect({ MODE: "mainnet", URL, device: "", signer })
    let nonce = 0
    const json0 = await set(request, ["init", init_query], ++nonce, pid)
    const json = await set(request, q1, ++nonce, pid)
    const json2 = await set(request, q2, ++nonce, pid)
    const json3 = await get(request, ["users"], pid)
    console.log(json3)
    assert.deepEqual(json3.res, [bob])
  })

  it("should recover db from HB", async () => {
    const port = 10002
    const port2 = 6363
    const port3 = 5000
    const hbeam = runHB(port)
    await wait(5000)
    const hb = `http://localhost:${port}`
    const URL = `http://localhost:${port2}`
    const URL2 = `http://localhost:${port3}`

    const { pid, signer, jwk, addr, dbpath } = await deploy({ hb })
    console.log("pid", pid)
    console.log("addr", addr)
    const node = await server({ dbpath, jwk, hb })

    const { request } = connect({ MODE: "mainnet", URL, device: "", signer })

    let nonce = 0
    const json0 = await set(request, ["init", init_query], ++nonce, pid)
    const json = await set(request, q1, ++nonce, pid)
    const json2 = await set(request, q2, ++nonce, pid)
    const json3 = await get(request, ["users"], pid)
    assert.deepEqual(json3.res, [bob])
    await wait(1000)
    node.stop()
    const node2 = await server({ dbpath, jwk, hb, port: port3 })
    await wait(3000)
    const { request: request2 } = connect({
      MODE: "mainnet",
      URL: URL2,
      device: "",
      signer,
    })
    const json3_2 = await get(request2, ["users"], pid)
    assert.deepEqual(json3_2.res, [bob])
    node2.stop()
    await wait(3000)
    hbeam.stop()
  })

  it("should run a server", async () => {
    const port = 10002
    const port2 = 6363
    const hbeam = runHB()
    await wait(5000)
    const hb = `http://localhost:${port}`
    const URL = `http://localhost:${port2}`

    const { pid, signer, jwk, addr, dbpath } = await deploy({ hb })
    console.log("pid", pid)
    console.log("addr", addr)
    const node = await server({ dbpath, jwk, hb })

    const { request } = connect({ MODE: "mainnet", URL, device: "", signer })

    let nonce = 0
    const json0 = await set(request, ["init", init_query], ++nonce, pid)
    const json = await set(request, q1, ++nonce, pid)
    const json2 = await set(request, q2, ++nonce, pid)
    const json3 = await get(request, ["users"], pid)
    assert.deepEqual(json3.res, [bob])
    await wait(1000)
    const db = await recover({ pid, hb, dbpath: genDir(), jwk })
    assert.deepEqual(db.get("users"), [bob], pid)

    const { pid: pid2 } = await deploy({ hb })
    let nonce_2 = 0
    const json0_2 = await set(request, ["init", init_query], ++nonce_2, pid2)
    const json_2 = await set(request, q1, ++nonce_2, pid2)
    const json2_2 = await set(request, q3, ++nonce_2, pid2)
    const json3_2 = await get(request, ["users"], pid2)
    assert.deepEqual(json3_2.res, [alice])
    node.stop()
    await wait(3000)
    hbeam.stop()
  })
})

function to64(str) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(str))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function from64(str) {
  str = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(str.length + ((4 - (str.length % 4)) % 4), "=")
  return JSON.parse(decodeURIComponent(escape(atob(str))))
}
describe("Validator", () => {
  it.only("should validate HB WAL", async () => {
    const port = 10002
    const port2 = 6363
    const hbeam = runHB(port)
    await wait(5000)
    const hb = `http://localhost:${port}`
    const URL = `http://localhost:${port2}`
    const { process: pid } = await hbeam.spawn({})
    const signer = hbeam.signer
    const jwk = hbeam.jwk
    console.log("pid", pid)
    const dbpath = genDir()
    const node = await server({ dbpath, jwk, hb, pid, port: port2 })
    const { request } = connect({ MODE: "mainnet", URL, device: "", signer })
    let nonce = 0
    const json0 = await set(request, ["init", init_query], ++nonce, pid)
    const json = await set(request, q1, ++nonce, pid)
    const json2 = await set(request, q2, ++nonce, pid)
    const json3 = await get(request, ["users"], pid)
    assert.deepEqual(json3.res, [bob])
    const { process: validate_pid } = await hbeam.spawn({
      tags: { "execution-device": "weavedb@1.0", db: pid },
    })
    await wait(5000)
    const dbpath2 = genDir()
    await validate({ pid, hb, dbpath: dbpath2, jwk, validate_pid })
    await wait(5000)
    const json4 = await set(request, q3, ++nonce, pid)
    await wait(5000)
    await validate({ pid, hb, dbpath: dbpath2, jwk, validate_pid })
    await wait(5000)
    const { slot } = await hbeam.message({
      pid: validate_pid,
      tags: { Action: "Query", Query: JSON.stringify(["users"]) },
    })
    const {
      results: { data },
    } = await hbeam.compute(validate_pid, slot)
    assert.deepEqual(data, [alice, bob])
    const zkp = await zkjson({ pid: validate_pid, hb, dbpath: genDir() })
    await wait(5000)
    const proof = await zkp.proof({ dir: "users", doc: "alice", path: "name" })
    console.log(proof)
    assert.equal(proof[proof.length - 2], "4")
    node.stop()
    console.log("success!")
    await wait(3000)
    hbeam.stop()
    process.exit()
    return
  })
})
