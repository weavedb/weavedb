import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { of, pof } from "monade"
import { db as wdb } from "../../core/src/index.js"
import queue from "../src/queue.js"
import { open } from "lmdb"
import { resolve } from "path"
import BPT from "../../core/src/bpt.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import server from "../src/server.js"
import recover from "../src/recover.js"
import validate from "../src/validate.js"
import zkjson from "../src/zkjson.js"
import { spawn } from "child_process"
import { readFileSync } from "fs"
import { HyperBEAM } from "wao/test"
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
  sign,
  deployHB,
} from "./test-utils.js"
import {
  put,
  mod,
  del,
  addIndex,
  getIndexes,
  removeIndex,
} from "../../core/src/indexer.js"

import parseQuery from "../../core/src/parser.js"

import {
  range,
  get as planner_get,
  ranges,
  pranges,
  doc,
} from "../../core/src/planner.js"

import { connect, createSigner } from "@permaweb/aoconnect"
import { AO, HB } from "wao"
import { Server, mu, toAddr } from "wao/test"
import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"
import kv from "../../core/src/kv.js"

const getKV = () => {
  const io = open({ path: genDir() })
  return kv(io, c => {})
}

describe("WeaveDB Core", () => {
  it.only("should return write result", async () => {
    const io = open({
      path: "/home/basque/db/.cache/g_wtqwjsckainognrqfxunj6rksai3qzb4go3skke-k",
    })
    const db = wdb(kv(io, c => {}))
    console.log(db.get("posts").val())
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({
      jwk,
      id: "g_wtqwjsckainognrqfxunj6rksai3qzb4go3skke-k",
    })
    //console.log(await db.get("posts").val())
    const res = await db
      .write(await s.sign("add:post", { body: "yo2" }, "posts"))
      .val()
    console.log(res)
  })
  it("should return write result", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const db = wdb(getKV())
    const res = await db.write(await s.sign("init", init_query)).val()
    assert.equal(res.nonce, "1")
  })

  it("should cget and pagenate", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const db = wdb(getKV())
    await db.write(await s.sign("init", init_query))
    await db.write(await s.sign(...users_query))
    await db.write(await s.sign("set:user", bob, "users", "bob"))
    await db.write(await s.sign("set:user", alice, "users", "alice"))
    const cur = (await db.cget("users", 1).val())[0]
    assert.deepEqual(await db.get("users", ["startAfter", cur]).val(), [bob])
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
    assert.deepEqual(await db.get("users").val(), [{ name: "Bob", age: 4 }])
    await db.write(await s.sign("set:user", alice, "users", "alice"))
    assert.deepEqual(await db.get("users").val(), [
      alice,
      { name: "Bob", age: 4 },
    ])
  })

  it("should init", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const db = wdb(getKV())
    await db.write(await s.sign("init", init_query))
    assert.equal((await db.get("_", "_").val()).index, 0)
  })

  it("should add dirs", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const db = wdb(getKV())
    await db.write(await s.sign("init", init_query))
    await db.write(await s.sign(...users_query))
  })

  it("should update with _$ operators", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const db = wdb(getKV())
    await db.write(await s.sign("init", init_query))
    await db.write(await s.sign(...users_query))
    await db.write(
      await s.sign("set:user", { name: "Bob", age: 4 }, "users", "bob"),
    )
    await db.write(
      await s.sign("update:user", { age: { _$: ["inc"] } }, "users", "bob"),
    )
    assert.equal((await db.get("users", "bob").val()).age, 5)
  })

  it("should batch", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const db = wdb(getKV())
    await db.write(await s.sign("init", init_query))
    await db.write(await s.sign(...users_query))
    await db.write(
      await s.sign(
        "batch",
        ["set:user", bob, "users", "bob"],
        ["set:user", alice, "users", "alice"],
        ["update:user", { name: "Bobby" }, "users", "bob"],
      ),
    )
    assert.deepEqual(await db.get("users").val(), [alice, { name: "Bobby" }])
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
    await db.write(await s.sign("init", init_query))
    await db.write(await s.sign(...users_query))
    await db.write(
      await s.sign(
        "batch",
        ["set:user", bob, "users", "bob"],
        ["set:user", alice, "users", "alice"],
        ["set:user", mike, "users", "mike"],
        ["set:user", beth, "users", "beth"],
      ),
    )
    await db.write(
      await s.sign(
        "addIndex",
        [
          ["age", "desc"],
          ["name", "asc"],
        ],
        "users",
      ),
    )
    assert.deepEqual(await db.get("users", ["age", "desc"], ["name"]).val(), [
      beth,
      mike,
      alice,
      bob,
    ])
    assert.deepEqual(
      await db.get("users", ["favs", "array-contains", "peach"]).val(),
      [alice, beth, mike],
    )
    await db.write(
      await s.sign("batch", ["update:user", { age: 60 }, "users", "bob"]),
    )
    assert.deepEqual(await db.get("users", ["age", "desc"], ["name"]).val(), [
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
    await db.write(await s.sign("init", init_query))
    await db.write(await s.sign(...users_query))
    await db.write(await s.sign("set:user", bob, "users", "bob"))
    await db.write(await s.sign("set:user", alice, "users", "alice"))
    await db.write(await s.sign("add:user", mike, "users"))
    await db.write(await s.sign("add:user", beth, "users"))
    await db.write(await s.sign("del:user", "users", "bob"))
    await db.write(await s.sign("update:user", { age: 20 }, "users", "alice"))
    await db.write(await s.sign("upsert:user", john, "users", "john"))
    assert.deepEqual(await db.get("users", "alice").val(), {
      ...alice,
      age: 20,
    })
    assert.deepEqual(await db.get("users", "A").val(), mike)
    assert.deepEqual(await db.get("users", "B").val(), beth)
    assert.deepEqual(await db.get("users", "john").val(), john)
    await wait(100)

    // recover from kv
    const db2 = wdb(wkv)
    assert.equal(await db2.get("users", "bob").val(), null)
    assert.deepEqual(await db2.get("users", "alice").val(), {
      ...alice,
      age: 20,
    })
  })

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
