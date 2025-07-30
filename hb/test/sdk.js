import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { HyperBEAM, wait } from "wao/test"
import { DB } from "../../sdk/src/index.js"
import server from "../src/server.js"
import { resolve } from "path"
import { genDir } from "./test-utils.js"
const users = {
  name: "users",
  schema: { type: "object", required: ["name", "age"] },
  auth: [["set:user,add:user,update:user,upsert:user,del:user", [["allow()"]]]],
}

const bob = { name: "Bob", age: 23 }
describe("WeaveDB SDK", () => {
  let db, hbeam, node
  before(async () => {
    hbeam = await new HyperBEAM({ reset: true }).ready()
    db = new DB({ hb: hbeam.url, jwk: hbeam.jwk })
    node = await server({ dbpath: genDir(), jwk: hbeam.jwk, hb: hbeam.url })
    await wait(5000)
  })
  after(() => {
    node.stop()
    hbeam.kill()
  })
  it("should deploy a database", async () => {
    const pid = await db.spawn()
    assert((await db.mkdir(users)).success)
    assert((await db.set("set:user", bob, "users", "bob")).success)
    assert.deepEqual(await db.get("users", "bob"), bob)
  })
})
