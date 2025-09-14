import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { HyperBEAM, wait, acc } from "wao/test"
import { DB, to23 } from "../../sdk/src/index.js"
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
  it("should deploy a database", async () => {
    const pid = await db.spawn()
    assert((await db.mkdir(users)).success)
    assert((await db.set("set:user", bob, "users", "bob")).success)
    assert.deepEqual(await db.get("users", "bob"), bob)
    console.log(
      await db.batch([
        ["update:user", { age: { _$: ["inc"] } }, "users", "bob"],
        ["update:user", { age: { _$: ["inc"] } }, "users", "bob"],
        ["update:user", { age: { _$: ["inc"] } }, "users", "bob"],
      ]),
    )
    console.log(await db.get("users"))
  })
})

describe("WeaveDB SDK", () => {
  it("should convert Arweave address to zkp", async () => {
    assert.equal(to23(acc[0].addr), "ar--Rix7e0HB-8OAaimcoYkxTZB-dSs")
  })
  it.skip("should connect with remote nodes", async () => {
    const db = new DB({
      jwk: acc[0].jwk,
      url: "http://34.18.53.73:6364",
      hb: "http://34.18.53.73:10001",
    })
    const pid = await db.spawn()
    assert((await db.mkdir(users)).success)
    assert((await db.set("set:user", bob, "users", "bob")).success)
    assert.deepEqual(await db.get("users", "bob"), bob)
  })
})

describe("Triggers", () => {
  it("should connect with remote nodes", async () => {
    const dbpath = genDir()
    const jwk = acc[0].jwk
    const node = await server({ dbpath, jwk, hyperbeam: false })
    const db = new DB({ jwk, hb: null })
    const pid = await db.init({ id: "test" })
    assert((await db.mkdir(users)).success)
    assert((await db.set("set:user", bob, "users", "bob")).success)
    assert(
      (
        await db.addTrigger(
          {
            key: "add_age",
            on: "update,create",
            fn: [
              ["add()", [{ name: "Alice", age: 3 }, "users"]],
              ["update()", [{ age: { _$: ["inc"] } }, "users", "bob"]],
              [
                "when",
                ["both", ["always", true], ["always", true]],
                ["toBatch", ["update", { age: 5 }, "users", "bob"]],
                "$data",
              ],
            ],
            fields: ["age", "name"],
            match: "any",
          },
          "users",
        )
      ).success,
    )
    assert((await db.set("update:user", { age: 3 }, "users", "bob")).success)
    assert.deepEqual(await db.get("users"), [
      { age: 3, name: "Alice" },
      { age: 5, name: "Bob" },
    ])
    assert((await db.removeTrigger({ key: "add_age" }, "users")).success)
    assert((await db.setSchema({ type: "object" }, "users")).success)
    assert((await db.set("upsert:user", { age: 3 }, "users", "age")).success)
    assert.deepEqual(await db.get("users", "age"), { age: 3 })
    assert((await db.setRules([["set:user", [["allow()"]]]], "users")).success)
    try {
      await db.set("upsert:user", { age: 4 }, "users", "age2")
    } catch (e) {}
    assert.deepEqual(await db.get("users", "age2"), null)
    node.stop()
  })
})
