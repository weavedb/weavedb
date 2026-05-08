import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { wait, acc } from "wao/test"
import { kv, db as wdb, queue } from "../../core/src/index.js"
import { signer } from "../../core/src/utils.js"
import { init_query } from "../../core/src/preset.js"

const users_query = [
  "set:dir",
  {
    schema: { type: "object", required: ["name", "age"] },
    auth: [
      ["set:user,add:user,update:user,upsert:user,del:user", [["allow()"]]],
    ],
  },
  "_",
  "users",
]

const bob = { name: "Bob", age: 23 }

describe("WeaveDB SDK", () => {
  it("should deploy a database", async () => {
    let store = {}
    // weavekv calls io.put / io.remove synchronously inside io.transaction.
    const io = {
      put: (key, val) => (store[key] = val),
      get: key => store[key] ?? null,
      remove: key => delete store[key],
      transaction: async fn => fn(),
    }
    const sign = signer({ jwk: acc[0].jwk, id: "db-1" })
    // queue() wraps the raw {kv, res} into {success, err, res}.
    const db = queue(wdb(kv(io, () => {})))
    const r1 = await db.write(await sign("init", init_query))
    assert.equal(r1.success, true, "init failed: " + JSON.stringify(r1))
    const r2 = await db.write(await sign(...users_query))
    assert.equal(r2.success, true, "set:dir failed: " + JSON.stringify(r2))
    // setAuth + setSchema need to be installed explicitly (set:dir alone
    // doesn't wire them into the registry).
    const r3 = await db.write(
      await sign("setAuth", users_query[1].auth, "users"),
    )
    assert.equal(r3.success, true, "setAuth failed: " + JSON.stringify(r3))
    const r4 = await db.write(
      await sign("setSchema", users_query[1].schema, "users"),
    )
    assert.equal(r4.success, true, "setSchema failed: " + JSON.stringify(r4))
    const r5 = await db.write(await sign("set:user", bob, "users", "bob"))
    assert.equal(r5.success, true, "set:user failed: " + JSON.stringify(r5))
  })
})
