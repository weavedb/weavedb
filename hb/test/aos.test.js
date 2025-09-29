import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { queue, kv, db as wdb } from "../../core/src/index.js"
import { resolve } from "path"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import validate from "../src/validate.js"
import SU from "../src/su.js"
import { HyperBEAM, acc } from "wao/test"
import bundler from "../src/bundler.js"
import server from "../src/server.js"
import { DB } from "../../sdk/src/index.js"

import {
  get,
  set,
  bob,
  alice,
  mike,
  beth,
  john,
  wait,
  genDir,
  init_query,
  users_query,
  sign,
  deployHB,
} from "./test-utils.js"

import { connect, createSigner } from "@permaweb/aoconnect"
//import { AO, HB } from "wao"
import { AO, HB } from "../../../wao/src/index.js"
//import { Server, mu, toAddr } from "wao/test"
import { Server, mu, toAddr } from "../../../wao/src/test.js"
const q1 = users_query
const q2 = ["set:user", bob, "users", "bob"]
let qs = [q1, q2]

const validateDB = async ({ hbeam, pid, hb, jwk }) => {
  const { pid: validate_pid } = await hbeam.spawn({
    "execution-device": "weavedb@1.0",
    db: pid,
  })
  await wait(10000)
  const dbpath2 = genDir()
  await validate({ pid, hb, dbpath: dbpath2, jwk, validate_pid })
  await wait(10000)
  const { slot } = await hbeam.schedule({
    pid: validate_pid,
    tags: { Action: "Query", Query: JSON.stringify(["users"]) },
  })
  const {
    results: { data },
  } = await hbeam.compute({ pid: validate_pid, slot })
  return { validate_pid, dbpath2 }
}

const sport = 5000
describe("AOS", () => {
  let hb, hbeam, bd, jwk, node, su
  before(async () => {
    hbeam = new HyperBEAM({
      reset: true,
      gateway: sport,
      bundler_ans104: false,
      //bundler_httpsig: "http://localhost:4001",
    })
    jwk = hbeam.jwk
    su = new SU({ jwk, mu_aos: "http://localhost:5002", bundler: null })
    bd = bundler({ jwk })
    await hbeam.ready()
    const dbpath = genDir()
    node = await server({
      dbpath,
      jwk,
      hb: hbeam.hb.url,
      gateway: sport,
    })
  })
  beforeEach(async () => (hb = hbeam.hb))
  after(async () => {
    bd.close()
    node.stop()
    hbeam.kill()
    process.exit()
  })

  it.only("should serve AOS Legacynet", async () => {
    const db = new DB({ jwk })
    const pid = await db.spawn()
    await db.mkdir({
      name: "users",
      schema: { type: "object", required: ["name"] },
      auth: [
        ["set:user,add:user,update:user,upsert:user,del:user", [["allow()"]]],
      ],
    })
    await db.set("add:user", { name: "Bob" }, "users")
    await db.set("add:user", { name: "Alice" }, "users")
    await db.set("add:user", { name: "Mike" }, "users")
    await wait(5000)
    const _hbeam = new HB({ jwk, format: "ans104" })
    const { validate_pid, dbpath2 } = await validateDB({
      hbeam: _hbeam,
      pid,
      hb: hb.url,
      jwk,
    })
    const src_data = `
ao.authorities = { "${toAddr(mu.jwk.n)}", "${toAddr(jwk.n)}" }
local json = require("json")
Handlers.add("Hello", "Hello", function (msg)
  local data = Send({ Target = msg.To, Action = "Query", Query = msg.Query, __SU__ = msg.Hb }).receive().Data
  msg.reply({ Data = json.encode(data) })
end)`

    const server_aos = new Server({ port: sport, log: true })
    let ao = await new AO({
      port: sport,
      module: "ISShJH1ij-hPPt9St5UFFr_8Ys3Kj5cyg7zrMGt7H9s",
    }).init(mu.jwk)
    await ao.postScheduler({ url: `http://localhost:${sport + 3}` })
    const { p, pid: pid2 } = await ao.deploy({ src_data })
    const users = await p.m(
      "Hello",
      {
        To: validate_pid,
        Query: JSON.stringify(["users"]),
        Action: "Hello",
        Hb: `http://localhost:4003`,
      },
      { timeout: 3000, get: true },
    )
    assert.deepEqual(users, [
      { name: "Bob" },
      { name: "Alice" },
      { name: "Mike" },
    ])
  })
})

describe("AOS2", () => {
  let hb, hbeam, bd, jwk, node, su
  before(async () => {
    jwk = acc[0].jwk
    su = new SU({ jwk, mu_aos: "http://localhost:5002", bundler: null })
  })
  after(async () => process.exit())
  // this fails due to mock HB process
  it.skip("should serve AOS Legacynet", async () => {
    const src_data = `
ao.authorities = { "${toAddr(mu.jwk.n)}", "${toAddr(jwk.n)}" }
local json = require("json")
Handlers.add("Hello", "Hello", function (msg)
  local data = Send({ Target = msg.To, Action = "Query", Query = msg.Query, __SU__ = msg.Hb }).receive().Data
  msg.reply({ Data = json.encode(data) })
end)`

    const server_aos = new Server({ port: sport, log: true })
    let ao = await new AO({
      port: sport,
      module: "ISShJH1ij-hPPt9St5UFFr_8Ys3Kj5cyg7zrMGt7H9s",
    }).init(mu.jwk)
    await ao.postScheduler({ url: `http://localhost:${sport + 3}` })
    const { p, pid: pid2 } = await ao.deploy({ src_data: src_data })
    const users = await p.m(
      "Hello",
      {
        To: "ISShJH1ij-hPPt9St5UFFr_8Ys3Kj5cyg7zrMGt7H9s",
        Query: JSON.stringify(["users"]),
        Action: "Hello",
        Hb: `http://localhost:4003`,
      },
      { timeout: 3000, get: true },
    )
    console.log(users)
  })
})
