import assert from "assert"
import { repeat } from "ramda"
import { describe, it } from "node:test"
import server from "../src/server.js"
import { Validator } from "../src/validate.js"
import CU from "../src/cu.js"
import { HyperBEAM } from "wao/test"
//import { DB } from "wdb-sdk"
import { DB } from "../../sdk/src/index.js"
import { wait, genDir, genUser } from "./test-utils.js"
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

const auth = [["add:user,update:user,del:user", [["allow()"]]]]
const autosync = 3000
const dbpath = genDir()
const dbpath_server = genDir()

describe("Validator", () => {
  it("should validate HB WAL", async () => {
    const os = await new HyperBEAM({ bundler_ans104: false }).ready()
    const jwk = os.jwk
    const node = await server({ dbpath: dbpath_server, jwk })
    const db = new DB({ jwk })
    const pid = await db.spawn()
    await db.mkdir({ name: "users", auth })
    await db.set("add:user", { name: "Bob", age: 23, tags: ["user"] }, "users")
    await db.set("add:user", { name: "Alice", age: 30 }, "users")
    for (let i = 0; i < 10; i++) await db.set("add:user", genUser(), "users")
    const { vhb, vid } = await vspawn({ pid, jwk })
    const val = await new Validator({ autosync, pid, jwk, dbpath, vid }).init()
    ;(await wait(3000), await val.write(), await wait(3000), await val.commit())
    await db.set("update:user", { age: 35 }, "users", "A")
    await db.set("update:user", { age: { _$: "del" } }, "users", "B")
    await db.addIndex([["name"], ["age"]], "users")
    ;(await wait(3000), await val.get(), await val.write())
    ;(await wait(3000), await val.commit())
    await db.set("del:user", "users", "B")
    ;(await wait(3000), await val.get(), await val.write())
    ;(await wait(3000), await val.commit())
    const cu = await CU({ dbpath: genDir(), jwk, autosync: 3000 })
    const vcu = await cu.add(vid, 3000)
    await wait(5000)
    console.log(await vget(vhb, vid, ["users", 1]))
    console.log(await vget(vhb, vid, ["users", 2]))
    console.log(
      await vget(vhb, vid, ["users", ["tags", "array-contains", "user"], 10]),
    )
    await val.stopSync()
    await vcu.stopSync()
    await vcu.stopWrite()
    await wait(5000)
    ;(node.stop(), os.kill(), cu.server.close(), process.exit())
  })
})
