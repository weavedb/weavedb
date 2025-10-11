import assert from "assert"
import { Server, mu, toAddr } from "../../../wao/src/test.js"
import bundler from "../src/bundler.js"
import SU from "../src/su.js"
import { repeat } from "ramda"
import { before, after, describe, it } from "node:test"
import server from "../src/server.js"
import gateway from "../src/gateway.js"
import { Validator } from "../src/validate.js"
import CU from "../src/cu.js"
import { HyperBEAM } from "wao/test"
//import { DB } from "wdb-sdk"
import { DB } from "../../sdk/src/index.js"
import { wait, genDir, genUser } from "./test-utils.js"
import { HB, AO } from "wao"

const vspawn = async ({ pid: db, jwk }) => {
  const vhb = new HB({ jwk, format: "ans104" })
  let vid = null
  let i = 0
  do
    vid = (
      await vhb.spawn({
        "execution-device": "weavedb@1.0",
        db,
        nonce: 1,
        version: "0.1.0",
      })
    ).pid
  while (!vid && ++i < 5 && (await wait(3000)))
  return { vhb, vid }
}

const vget = async (vhb, pid, q, act = "Query") => {
  const tags = { Action: act, Query: JSON.stringify(q) }
  return JSON.parse((await vhb.message({ pid, tags })).res.results.data)
}

const auth = [["add:user,update:user,del:user", [["allow()"]]]]
const autosync = 3000
const dbpath = genDir()
const dbpath_server = genDir()

const sport = 5000

// HyperBEAM, Rollup, Gateway, SU, CU, Bundler, AOS, Validator, ZK-Proover
describe("Validator", () => {
  let os, jwk, gw, su, bd, ru, cu, aos
  before(async () => {
    os = new HyperBEAM({
      bundler_ans104: false,
      bundler_httpsig: "http://localhost:5501/tx",
    })
    jwk = os.jwk
    gw = await gateway({ port: 5500 })
    su = new SU({
      jwk,
      mu: "http://localhost:5002",
      bundler: null,
    })
    bd = await bundler({ jwk, mock: true, port: 5501 })
    await os.ready()
    ru = await server({
      dbpath: genDir(),
      jwk,
      hb: os.hb.url,
      gateway: sport,
    })
    cu = await CU({
      dbpath: genDir(),
      jwk,
      autosync: 3000,
      gateway: "http://localhost:5500",
    })
    aos = new Server({ port: sport, log: true })
  })
  after(async () => {
    bd.close()
    ru.stop()
    os.kill()
    process.exit()
  })
  it.only("should serve aos", async () => {
    const db = new DB({ jwk })
    const pid = await db.spawn()
    await db.mkdir({
      name: "users",
      schema: { type: "object", required: ["name"] },
      auth: [
        ["set:user,add:user,update:user,upsert:user,del:user", [["allow()"]]],
      ],
    })
    await db.set("add:user", { name: "Bob", male: true }, "users")
    await db.set("add:user", { name: "Alice", male: false }, "users")
    await db.set("add:user", { name: "Mike", male: true }, "users")
    await wait(5000)
    console.log(
      await fetch(`http://localhost:4003/${pid}/latest`).then(r => r.json()),
    )

    return
    const { vhb, vid } = await vspawn({ pid, jwk })
    const val = await new Validator({
      autosync,
      pid,
      jwk,
      dbpath,
      vid,
      gateway: "http://localhost:5500",
    }).init()
    ;(await wait(3000), await val.write(), await wait(3000), await val.commit())
    const vcu = await cu.add(vid, 3000)
    await wait(5000)

    const src_data = `
ao.authorities = { "${toAddr(mu.jwk.n)}", "${toAddr(jwk.n)}" }
local json = require("json")
Handlers.add("Hello", "Hello", function (msg)
  local data = Send({ Target = msg.To, Action = "Query", Query = msg.Query, __SU__ = msg.Hb }).receive().Data
  msg.reply({ Data = data })
end)`
    let ao = await new AO({
      port: sport,
      module: "ISShJH1ij-hPPt9St5UFFr_8Ys3Kj5cyg7zrMGt7H9s",
    }).init(mu.jwk)
    await ao.postScheduler({ url: `http://localhost:${sport + 3}` })
    const { p, pid: pid2 } = await ao.deploy({ src_data })
    const users = await p.m(
      "Hello",
      {
        To: vid,
        Query: JSON.stringify(["get", "users"]),
        Action: "Hello",
        Hb: `http://localhost:4003`,
      },
      { timeout: 3000, get: true },
    )
    console.log(users)
    assert.deepEqual(JSON.parse(users), [
      { name: "Bob", male: true },
      { name: "Alice", male: false },
      { name: "Mike", male: true },
    ])
  })
})
describe("Validator", () => {
  it("should upgrade", async () => {
    const os = await new HyperBEAM({ bundler_ans104: false }).ready()
    const jwk = os.jwk
    const node = await server({
      dbpath: dbpath_server,
      jwk,
      gateway: "http://localhost:5000",
    })
    const gw = await gateway({})
    const db = new DB({ jwk })
    const pid = await db.spawn({ version: "0.1.0" })
    await db.mkdir({ name: "users", auth })
    await db.set(
      "add:user",
      { name: "Bob", age: 23, male: true, tags: ["user"] },
      "users",
    )
    await db.set("add:user", { name: "Alice", age: 30 }, "users")
    await db.set("upgrade", "0.1.1")
    console.log(await db.set("migrate"))
    for (let i = 0; i < 10; i++) await db.set("add:user", genUser(), "users")
    console.log(await db.get("users"))
    await wait(5000)
    node.stop()
    await wait(5000)
    // recovery
    const node2 = await server({
      dbpath: dbpath_server,
      jwk,
      gateway: "http://localhost:5000",
    })
    await wait(3000)
  })

  it("should validate HB WAL", async () => {
    const os = await new HyperBEAM({ bundler_ans104: false }).ready()
    const jwk = os.jwk
    const node = await server({
      dbpath: dbpath_server,
      jwk,
      gateway: "http://localhost:5000",
    })
    const gw = await gateway({})
    const db = new DB({ jwk })
    const pid = await db.spawn({ version: "0.1.0" })
    await db.mkdir({ name: "users", auth })
    await db.set(
      "add:user",
      { name: "Bob", age: 23, male: true, tags: ["user"] },
      "users",
    )
    await db.set("add:user", { name: "Alice", age: 30 }, "users")
    //await db.set("upgrade", "0.1.1")
    //console.log(await db.set("migrate"))
    //for (let i = 0; i < 10; i++) await db.set("add:user", genUser(), "users")
    console.log(await db.get("users"))
    const cu = await CU({
      dbpath: genDir(),
      jwk,
      autosync: 3000,
      gateway: "http://localhost:5000",
    })
    const { vhb, vid } = await vspawn({ pid, jwk })
    const val = await new Validator({
      autosync,
      pid,
      jwk,
      dbpath,
      vid,
      gateway: "http://localhost:5000",
    }).init()
    ;(await wait(3000), await val.write(), await wait(3000), await val.commit())
    await db.set("update:user", { age: 35 }, "users", "A")
    await db.set("update:user", { age: { _$: "del" } }, "users", "B")
    await db.addIndex([["name"], ["age"]], "users")
    ;(await wait(3000), await val.get(), await val.write())
    ;(await wait(3000), await val.commit())
    await db.set("del:user", "users", "B")
    ;(await wait(3000), await val.get(), await val.write())
    ;(await wait(3000), await val.commit())
    const vcu = await cu.add(vid, 3000)
    await wait(5000)
    //console.log(await vget(vhb, vid, ["get", "users", 1]))
    //console.log(await vget(vhb, vid, ["cget", "users", 2]))
    //console.log(await vget(vhb, vid, ["cget", "users", 2]))
    console.log(
      await vget(vhb, vid, [
        "get",
        "users",
        ["tags", "array-contains", "user"],
        10,
      ]),
    )
    console.log(await vget(vhb, vid, ["upgrade", "0.1.1"], "Query"))
    //console.log(await vget(vhb, vid, ["revert"], "Query"))
    console.log(await vget(vhb, vid, ["migrate"], "Query"))
    await wait(3000)
    for (let i = 0; i < 10; i++) await db.set("add:user", genUser(), "users")
    await wait(3000)
    ;(await wait(3000), await val.get(), await val.write())
    ;(await wait(3000), await val.commit())
    console.log(await vget(vhb, vid, ["get", "users"], "Query"))
    await val.stopSync()
    await vcu.stopSync()
    await vcu.stopWrite()
    await wait(5000)
    ;(node.stop(), os.kill(), cu.server.close(), process.exit())
  })
})
