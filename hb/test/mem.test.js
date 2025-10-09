import assert from "assert"
import { describe, it } from "node:test"
import { acc } from "wao/test"
import { open } from "lmdb"
import { wait, genDir } from "./test-utils.js"
import { DB, wdb23, wdb160 } from "../../sdk/src/index.js"
import { pluck } from "ramda"
import { kv, db as wdb, queue, mem } from "../../core/src/index.js"
import { Core } from "../../core/src/index.js"

const owner = acc[0]
const user1 = acc[1]
const user2 = acc[2]

const users = [user1, user2]

describe("Mem", () => {
  it.only("should run DB in memory", async () => {
    const dbpath = genDir()
    const pid = "abc"
    const io = open({ path: `${dbpath}/${pid}` })
    const wkv = kv(io, async c => {})
    const module = "qNsozxWTsmIEy0AaaDsbEBqD-nnn5qZ8KIMdzzu0Fa8"
    const core = await new Core({ io }).init({ version: "0.1.0" })
    const db = new DB({ jwk: owner.jwk, mem: core.db })
    const id = await db.init({ id: "wdb", version: "0.1.0" })
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
    await db.upgrade("0.1.1")
    try {
      await db.set("add:add", { name: "Bob", age: 23 }, "users")
    } catch (e) {
      console.log(e)
    }
    await db.revert()
    console.log(await db.set("add:add", { name: "Bob", age: 23 }, "users"))
    console.log(await db.get("users", ["name"], ["age", "desc"]))
    await db.upgrade("0.1.1")
    await db.migrate()
    console.log(await db.set("add:add", { name: "Bob", age: 23 }, "users"))
  })
})
