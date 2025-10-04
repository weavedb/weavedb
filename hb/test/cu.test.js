import assert from "assert"
import { describe, it } from "node:test"
import server from "../src/server.js"
import { Validator } from "../src/validate.js"
import CU from "../src/cu.js"
import { HyperBEAM } from "wao/test"
import { DB } from "wdb-sdk"
import { wait, genDir } from "./test-utils.js"
import { HB } from "wao"

const vspawn = async ({ pid: db, jwk }) => {
  const vhb = new HB({ jwk, format: "ans104" })
  let vid = null
  let i = 0
  do vid = (await vhb.spawn({ "execution-device": "weavedb@1.0", db })).pid
  while (!vid && ++i < 5 && (await wait(3000)))
  return { vhb, vid }
}

const vget = async (vhb, pid, q) => {
  const tags = { Action: "Query", Query: JSON.stringify(q) }
  return (await vhb.message({ pid, tags })).res.results.data
}

describe("Validator", () => {
  it("should validate HB WAL", async () => {
    const os = await new HyperBEAM({ bundler_ans104: false }).ready()
    const jwk = os.jwk
    const node = await server({ dbpath: genDir(), jwk })
    const db = new DB({ jwk })
    const pid = await db.spawn()
    await db.mkdir({
      name: "users",
      auth: [["add:user,update:user,del:user", [["allow()"]]]],
    })
    await db.set("add:user", { name: "Bob", age: 23 }, "users")
    await db.set("add:user", { name: "Alice", age: 30 }, "users")
    const { vhb, vid } = await vspawn({ pid, jwk })
    const val = await new Validator({ pid, jwk, dbpath: genDir(), vid }).init()
    ;(await wait(3000), await val.get(), await val.write())
    ;(await wait(3000), await val.commit())
    console.log(await vget(vhb, vid, ["users"]))
    await db.set("update:user", { age: 35 }, "users", "A")
    await db.set("update:user", { age: { _$: "del" } }, "users", "B")
    await db.addIndex([["name"], ["age"]], "users")
    ;(await wait(3000), await val.get(), await val.write())
    ;(await wait(3000), await val.commit())
    await db.set("del:user", "users", "B")
    ;(await wait(3000), await val.get(), await val.write())
    ;(await wait(3000), await val.commit())
    const cu = await CU({ pid: vid, dbpath: genDir(), jwk })
    await wait(5000)
    console.log(await cu.proof({ dir: "users", doc: "A", path: "name" }))
    console.log(await cu.proof({ dir: "users", doc: "B", path: "name" }))
    ;(node.stop(), os.kill(), cu.server.close(), process.exit())
  })
})
