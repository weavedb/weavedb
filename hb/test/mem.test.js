import assert from "assert"
import { describe, it } from "node:test"
import { acc } from "wao/test"
import { open } from "lmdb"
import { wait, genDir } from "./test-utils.js"
import { DB, wdb23, wdb160 } from "../../sdk/src/index.js"
import { pluck } from "ramda"
import { Core, kv, io, db as wdb, queue, mem } from "../../core/src/index.js"
const owner = acc[0]
const user1 = acc[1]
const user2 = acc[2]

const users = [user1, user2]
let nonce = 0
const q = query => {
  return {
    headers: { id: "wdb", nonce: ++nonce, query: JSON.stringify(query) },
    keyid: acc[0].jwk.n,
  }
}
describe("Mem", () => {
  it.only("should be able to chain with bare core", async () => {
    const wkv = kv(io(), async c => {})
    const db = wdb(wkv, { branch: "noauth" })
    const res = db
      .db()
      .write(q(["init", {}]))
      .write(q(["mkdir", "users"]))
      .k({ kv: db.kv })
      .val()
    console.log(db.get(["_", "users"]).res.result)
  })
  it("should measure tps", async () => {
    const dbpath = genDir()
    const pid = "abc"
    const io = open({ path: `${dbpath}/${pid}` })
    const wkv = kv(io, async c => {})
    const core = await new Core({ io }).init({ env: { branch: "main" } })
    const db = new DB({ jwk: owner.jwk, mem: core.db })
    const id = await db.init({ id: "wdb", branch: "main" })
    await db.mkdir({
      name: "users",
      auth: [["add:add,set:set,update:update,del:del", [["allow()"]]]],
    })
    const start = Date.now()
    for (let i = 0; i < 10; i++) {
      await db.set("add:add", { name: "Bob" }, "users")
    }
    console.log(Math.floor(1000 / ((Date.now() - start) / 1000)), "tps")
    console.log(await db.get("users", 3))
  })

  it("should give microsecond timestamps", async () => {
    const dbpath = genDir()
    const pid = "abc"
    const io = open({ path: `${dbpath}/${pid}` })
    const wkv = kv(io, async c => {})
    const core = await new Core({ io }).init({})
    const db = new DB({ jwk: owner.jwk, mem: core.db })
    const id = await db.init({ id: "wdb" })
    await db.mkdir({
      name: "users",
      auth: [
        [
          "add:add,set:set,update:update,del:del",
          [["mod()", { ts: "$ts" }], ["allow()"]],
        ],
      ],
    })
    const trigger = {
      key: "add_user",
      on: "create",
      fn: [["add()", [{ name: "Alice", age: 32, ts: "$ts" }, "users"]]],
    }
    await db.addTrigger(trigger, "users")
    const start = Date.now()
    for (let i = 0; i < 1000; i++) {
      await db.set("add:add", { name: "Bob", age: 23 }, "users")
    }
    console.log(Math.floor(1000 / ((Date.now() - start) / 1000)), "tps")
    console.log(await db.get("users", ["ts", "desc"], 3))
  })
  it("should run DB in memory", async () => {
    const dbpath = genDir()
    const pid = "abc"
    const io = open({ path: `${dbpath}/${pid}` })
    const wkv = kv(io, async c => {})
    const core = await new Core({ io }).init({})
    const db = new DB({ jwk: owner.jwk, mem: core.db })
    const id = await db.init({ id: "wdb" })
    await db.mkdir({
      name: "users",
      auth: [["add:add,set:set,update:update,del:del", [["allow()"]]]],
    })
    const trigger = {
      key: "inc_age",
      on: "create",
      fn: [["update()", [{ age: { _$: ["inc"] } }, "users", "$doc"]]],
    }
    await db.addTrigger(trigger, "users")
    await db.set("add:add", { name: "Bob", age: 23 }, "users")
    await db.removeTrigger({ key: "inc_age" }, "users")
    await db.set("add:add", { name: "Bob", age: 24 }, "users")
    await db.addIndex([["name"], ["age", "desc"]], "users")
    //await db.setAuth([], "users")
    await db.stat("users")
    //await db.upgrade("0.1.1")
    try {
      await db.set("add:add", { name: "Bob", age: 23 }, "users")
    } catch (e) {
      console.log(e)
    }
    //    await db.revert()
    console.log(await db.set("add:add", { name: "Bob", age: 23 }, "users"))
    console.log(await db.get("users", ["name"], ["age", "desc"]))
    //    await db.upgrade("0.1.1")
    //  await db.migrate()
    console.log(await db.set("add:add", { name: "Bob", age: 23 }, "users"))
  })
})
