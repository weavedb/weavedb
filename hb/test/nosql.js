import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { resolve } from "path"
import { wait } from "wao/test"
import { readFileSync } from "fs"
import WDB from "../src/wdb.js"

import { HB } from "wao"

describe("JS Rollup", () => {
  it("should query", async () => {
    const jwk = JSON.parse(
      readFileSync(
        resolve(import.meta.dirname, "../../HyperBEAM/.wallet.json"),
        "utf8",
      ),
    )
    const wdb = new WDB({ jwk })
    await wdb.spawn()
    const users = {
      name: "users",
      schema: { type: "object", required: ["name", "age"] },
      auth: [
        ["set:user,add:user,update:user,upsert:user,del:user", [["allow()"]]],
      ],
    }
    await wdb.mkdir(users)
    await wdb.set("set:user", { name: "Bob", age: 20 }, "users", "bob")
    await wdb.set("set:user", { name: "Alice", age: 30 }, "users", "alice")
    console.log(await wdb.get("users"))
    console.log(await wdb.get("users", ["age"]))
    const u = await wdb.cget("users", ["age", "desc"], 1)
    console.log(await wdb.cget("users", ["age", "desc"], ["startAfter", u[0]]))
  })

  it.only("should query", async () => {
    const host = "http://34.18.53.73"
    const id = "Npiag-iJQJEv2fiZhrSgMJJ1FujBL_6ElmNdIE3pd6Y"
    const port = 6363
    const hb = 10001
    const jwk = JSON.parse(
      readFileSync(
        resolve(import.meta.dirname, "../../HyperBEAM/.wallet.json"),
        "utf8",
      ),
    )
    const wdb = new WDB({
      id,
      jwk,
      port: `${host}:${port}`,
      hb: `${host}:${hb}`,
    })
    //console.log(await wdb.spawn())
    const users = {
      name: "users",
      schema: { type: "object", required: ["name", "age"] },
      auth: [
        ["set:user,add:user,update:user,upsert:user,del:user", [["allow()"]]],
      ],
    }
    //await wdb.mkdir(users)
    //await wdb.set("set:user", { name: "Bob", age: 20 }, "users", "bob")
    //await wdb.set("set:user", { name: "Alice", age: 30 }, "users", "alice")
    await wdb.set("set:user", { name: "Jane", age: 50 }, "users", "jane")
    console.log("users", await wdb.get("users"))
  })
})
