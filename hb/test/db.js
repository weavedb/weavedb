import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { of, pof, fn, pfn } from "../src/monade.js"
import wdb from "../src/db.js"
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
  sign,
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
import { Server, mu } from "wao/test"
import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"
import kv from "../src/kv.js"

const getKV = () => {
  const io = open({ path: genDir() })
  return kv(io, c => {})
}

describe("WeaveDB Core", () => {
  it("should cget and pagenate", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const wkv = getKV()
    const db = wdb(wkv)
      .write(await s.sign("init", init_query))
      .write(await s.sign(...users_query))
      .write(await s.sign("set:user", bob, "users", "bob"))
      .write(await s.sign("set:user", alice, "users", "alice"))
    const cur = db.cget("users", 1)[0]
    assert.deepEqual(db.get("users", ["startAfter", cur]), [bob])
  })

  it("should handle queue", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const db = queue(wdb(getKV()))
    await db.write(await s.sign("init", init_query))
    await db.write(await s.sign(...users_query))
    await db.write(
      await s.sign("set:user", { name: "Bob", age: 4 }, "users", "bob"),
    )
    assert.deepEqual(db.get("users"), [{ name: "Bob", age: 4 }])
    await db.write(await s.sign("set:user", alice, "users", "alice"))
    assert.deepEqual(db.get("users"), [alice, { name: "Bob", age: 4 }])
  })

  it("should init", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const db = wdb(getKV()).write(await s.sign("init", init_query))
    assert.equal(db.get("_", "_").index, 0)
  })
  it("should add dirs", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const db = wdb(getKV())
      .write(await s.sign("init", init_query))
      .write(await s.sign(...users_query))
  })
  it("should update with _$ operators", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const wkv = getKV()
    const db = wdb(wkv)
      .write(await s.sign("init", init_query))
      .write(await s.sign(...users_query))
      .write(await s.sign("set:user", { name: "Bob", age: 4 }, "users", "bob"))
      .write(
        await s.sign("update:user", { age: { _$: ["inc"] } }, "users", "bob"),
      )
    assert.equal(db.get("users", "bob").age, 5)
  })

  it("should batch", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const wkv = getKV()
    const db = wdb(wkv)
      .write(await s.sign("init", init_query))
      .write(await s.sign(...users_query))
      .write(
        await s.sign(
          "batch",
          ["set:user", bob, "users", "bob"],
          ["set:user", alice, "users", "alice"],
          ["update:user", { name: "Bobby" }, "users", "bob"],
        ),
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
      .write(await s.sign("init", init_query))
      .write(await s.sign(...users_query))
      .write(
        await s.sign(
          "batch",
          ["set:user", bob, "users", "bob"],
          ["set:user", alice, "users", "alice"],
          ["set:user", mike, "users", "mike"],
          ["set:user", beth, "users", "beth"],
        ),
      )
      .write(
        await s.sign(
          "addIndex",
          [
            ["age", "desc"],
            ["name", "asc"],
          ],
          "users",
        ),
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
    db.write(
      await s.sign("batch", ["update:user", { age: 60 }, "users", "bob"]),
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
      .write(await s.sign("init", init_query))
      .write(await s.sign(...users_query))
      .write(await s.sign("set:user", bob, "users", "bob"))
      .write(await s.sign("set:user", alice, "users", "alice"))
      .write(await s.sign("add:user", mike, "users"))
      .write(await s.sign("add:user", beth, "users"))
      .write(await s.sign("del:user", "users", "bob"))
      .write(await s.sign("update:user", { age: 20 }, "users", "alice"))
      .write(await s.sign("upsert:user", john, "users", "john"))
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

const runHB = (port, sport) => {
  const env = {
    //DIAGNOSTIC: "1",
    CMAKE_POLICY_VERSION_MINIMUM: "3.5",
    CC: "gcc-12",
    CXX: "g++-12",
  }
  return new HBeam({ cwd: "../../HyperBEAM", env, port, sport })
}

describe("Server", () => {
  it.skip("should connect with a remote server", async () => {
    const hb = "http://localhost:10000"
    const URL = "http://localhost:4000"

    const { pid, signer, jwk, addr, dbpath } = await deploy({ hb })
    console.log("pid", pid)
    console.log("addr", addr)
    const { request } = connect({ MODE: "mainnet", URL, device: "", signer })
    let nonce = 0
    const json0 = await set(request, ["init", init_query], ++nonce, pid)
    console.log(json0)
    const json = await set(request, q1, ++nonce, pid)
    console.log(json)
    const json2 = await set(request, q2, ++nonce, pid)
    console.log(json2)
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
    const node = await server({ dbpath, jwk, hb, port: port2 })

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
    const hbeam = runHB(port)
    await wait(5000)
    const hb = `http://localhost:${port}`
    const URL = `http://localhost:${port2}`

    const { pid, signer, jwk, addr, dbpath } = await deploy({ hb })
    console.log("pid", pid)
    console.log("addr", addr)
    const node = await server({ dbpath, jwk, hb, port: port2 })

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

const checkZK = async ({ pid, hb }) => {
  const zkp = await zkjson({ pid, hb, dbpath: genDir() })
  await wait(5000)
  const proof = await zkp.proof({ dir: "users", doc: "alice", path: "name" })
  console.log(proof)
  assert.equal(proof[proof.length - 2], "4")
  console.log("success!")
  await wait(3000)
}
const deployHB = async ({ port, sport }) => {
  const port2 = 6363
  const hbeam = runHB(port, sport)
  await wait(5000)
  const hb = `http://localhost:${port}`
  const URL = `http://localhost:${port2}`
  const { process: pid } = await hbeam.spawn({})
  const signer = hbeam.signer
  const jwk = hbeam.jwk
  console.log("pid", pid)
  const dbpath = genDir()
  const node = await server({
    dbpath,
    jwk,
    hb,
    pid,
    port: port2,
    gateway: sport,
  })
  const { request } = connect({ MODE: "mainnet", URL, device: "", signer })
  return { node, pid, request, hbeam, jwk, hb }
}
const setup = async ({ pid, request }) => {
  let nonce = 0
  const json0 = await set(request, ["init", init_query], ++nonce, pid)
  const json = await set(request, q1, ++nonce, pid)
  const json2 = await set(request, q2, ++nonce, pid)
  const json3 = await get(request, ["users"], pid)
  assert.deepEqual(json3.res, [bob])
  return { nonce }
}
const validateDB = async ({ hbeam, pid, hb, jwk }) => {
  const { process: validate_pid } = await hbeam.spawn({
    tags: { "execution-device": "weavedb@1.0", db: pid },
  })
  await wait(5000)
  const dbpath2 = genDir()
  await validate({ pid, hb, dbpath: dbpath2, jwk, validate_pid })
  await wait(5000)
  const { slot } = await hbeam.message({
    pid: validate_pid,
    tags: { Action: "Query", Query: JSON.stringify(["users"]) },
  })
  const {
    results: { data },
  } = await hbeam.compute(validate_pid, slot)
  assert.deepEqual(data, [bob])
  return { validate_pid, dbpath2 }
}
describe("Validator", () => {
  it("should validate HB WAL", async () => {
    const { node, pid, request, hbeam, jwk, hb } = await deployHB({
      port: 10005,
    })
    let { nonce } = await setup({ pid, request })

    const { validate_pid, dbpath2 } = await validateDB({
      hbeam,
      pid,
      hb,
      jwk,
    })
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
    await checkZK({ pid: validate_pid, hb })

    node.stop()
    hbeam.stop()
    return
  })
})

describe("AOS", () => {
  it.skip("should serve AOS Legacynet", async () => {
    const port = 10001
    const sport = 5000
    const { node, pid, request, hbeam, jwk, hb } = await deployHB({
      port,
      sport,
    })
    let { nonce } = await setup({ pid, request })
    const { validate_pid, dbpath2 } = await validateDB({ hbeam, pid, hb, jwk })
    const src_data = `
local count = 0
Handlers.add("Hello", "Hello", function (msg)
  local data = Send({ Target = msg.DB, Action = "Query",  Query = msg.Query, __HyperBEAM__ = msg.HyperBEAM }).receive().Data
  msg.reply({ Data = data })
end)`
    const server_aos = new Server({ port: sport, log: true })
    let ao = await new AO({ port: sport }).init(mu.jwk)
    await ao.postScheduler({ url: `http://localhost:${sport + 3}` })
    const { p, pid: pid2 } = await ao.deploy({ src_data })
    const users = await p.m(
      "Hello",
      {
        DB: validate_pid,
        Query: JSON.stringify(["users"]),
        Action: "Hello",
        HyperBEAM: `http://localhost:${port}`,
      },
      { timeout: 3000, get: true },
    )
    assert.deepEqual(users, [bob])
    await wait(5000)
    server_aos.end()
    hbeam.stop()
  })
})
