import assert from "assert"
import { describe, it } from "node:test"
import { acc } from "wao/test"
import { open } from "lmdb"
import { wait, genDir } from "./test-utils.js"
import { DB, wdb23, wdb160 } from "../../sdk/src/index.js"
import { pluck } from "ramda"
import { kv, db as wdb, queue, mem } from "../../core/src/index.js"
const owner = acc[0]
const user1 = acc[1]
const user2 = acc[2]

const users = [user1, user2]
const getKV = ({ pid, dbpath }) => {
  const io = open({ path: `${dbpath}/${pid}` })
  return kv(io, async c => {})
}

describe("Mem", () => {
  it.only("should run DB in memory", async () => {
    //const { q } = mem()
    const dbpath = genDir()
    const pid = "abc"
    const wkv = getKV({ dbpath, pid })
    const q = queue(wdb(wkv))
    const db = new DB({ jwk: owner.jwk, mem: q })
    const id = await db.init({ id: "wdb" })
    await db.mkdir({
      name: "users",
      auth: [["add:add,set:set,update:update,del:del", [["allow()"]]]],
    })
    await db.set("add:add", { name: "Bob", age: 23 }, "users")
    await db.set("add:add", { name: "Bob", age: 24 }, "users")
    console.log(await db.addIndex([["name"], ["age", "desc"]], "users"))
    console.log(await db.get("users", ["name"], ["age", "desc"]))
  })
})
