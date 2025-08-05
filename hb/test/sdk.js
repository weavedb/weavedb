import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { HyperBEAM, wait, acc } from "wao/test"
import { DB, $ } from "../../sdk/src/index.js"
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
  let db, hbeam
  before(async () => {
    hbeam = await new HyperBEAM({ as: ["weavedb"] }).ready()
    db = await new DB({ hb: hbeam.url, jwk: hbeam.jwk }).ready(true)
  })
  after(() => hbeam.kill())
  it.only("should deploy a database", async () => {
    const pid = await db.spawn()
    assert((await db.mkdir(users)).success)
    assert((await db.set("set:user", bob, "users", "bob")).success)
    assert.deepEqual(await db.get("users", "bob"), bob)
    await db.set("update:user", { age: $.inc(3) }, "users", "bob")
    console.log(await db.get("users"))
  })
})

describe("WeaveDB SDK", () => {
  it.skip("should connect with remote nodes", async () => {
    const db = new DB({
      jwk: acc[0].jwk,
      url: "http://34.18.53.73:6364",
      hb: "http://34.18.53.73:10001",
    })
    const pid = await db.spawn()
    console.log(pid)
    assert((await db.mkdir(users)).success)
    assert((await db.set("set:user", bob, "users", "bob")).success)
    assert.deepEqual(await db.get("users", "bob"), bob)
  })
})
