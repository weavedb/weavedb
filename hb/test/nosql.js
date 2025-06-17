import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { resolve } from "path"

import { readFileSync } from "fs"
import WDB from "../src/wdb.js"

import { HB } from "wao"

describe("JS Rollup", () => {
  it.only("should query", async () => {
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
})
