import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { of, pof } from "monade"
import { kv, db as wdb } from "../../core/src/index.js"
import queue from "../src/queue.js"
import { open } from "lmdb"
import { resolve } from "path"
import BPT from "../../core/src/bpt.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import server from "../src/server.js"
import recover from "../src/recover.js"
import validate from "../src/validate.js"
import zkjson from "../src/zkjson.js"
import { spawn } from "child_process"
import { readFileSync } from "fs"
import { HyperBEAM } from "wao/test"
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
import {
  put,
  mod,
  del,
  addIndex,
  getIndexes,
  removeIndex,
} from "../../core/src/indexer.js"

import parseQuery from "../../core/src/parser.js"

import {
  range,
  get as planner_get,
  ranges,
  pranges,
  doc,
} from "../../core/src/planner.js"

import { connect, createSigner } from "@permaweb/aoconnect"
import { AO, HB } from "wao"
import { Server, mu, toAddr } from "wao/test"
import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"

const getKV = () => {
  const io = open({ path: genDir() })
  return kv(io, c => {})
}

const deploy = async ({ hb, tags }) => {
  const { jwk, addr } = await new AO().ar.gen()
  const signer = createSigner(jwk)
  //const { request } = connect({ MODE: "mainnet", URL: hb, device: "", signer })
  const _hb = new HB({ jwk, url: hb })
  const address = (
    await fetch(`${hb}/~meta@1.0/info/serialize~json@1.0`).then(r => r.json())
  ).address
  const _tags = {
    "execution-device": "weavedb-wal@1.0",
    "random-seed": Math.random().toString(),
    ...tags,
  }
  const dbpath = genDir()
  //const res = await request(_tags)
  const { pid } = await _hb.spawn(_tags)
  return { pid, address, addr, jwk, signer, dbpath }
}

const q1 = users_query
const q2 = ["set:user", bob, "users", "bob"]
const q3 = ["set:user", alice, "users", "alice"]
let qs = [q1, q2]

describe("Server", () => {
  it.skip("should connect with a remote server", async () => {
    const hb = "http://localhost:10000"
    const URL = "http://localhost:4000"

    const { pid, signer, jwk, addr, dbpath } = await deploy({ hb })
    console.log("pid", pid)
    console.log("addr", addr)
    const _hb = new HB({ url: URL, jwk })
    //const { request } = connect({ MODE: "mainnet", URL, device: "", signer })
    let nonce = 0
    const json0 = await set(_hb, ["init", init_query], ++nonce, pid)
    console.log(json0)
    const json = await set(_hb, q1, ++nonce, pid)
    console.log(json)
    const json2 = await set(_hb, q2, ++nonce, pid)
    console.log(json2)
    const json3 = await get(_hb, ["get", "users"], pid)
    console.log(json3)
    assert.deepEqual(json3.res, [bob])
  })

  it("should recover db from HB", async () => {
    const port = 10002
    const port2 = 6364
    const port3 = 5000
    const hbeam = await new HyperBEAM({ port }).ready()
    await wait(5000)
    const hb = `http://localhost:${port}`
    const URL = `http://localhost:${port2}`
    const URL2 = `http://localhost:${port3}`

    const { pid, signer, jwk, addr, dbpath } = await deploy({ hb })
    console.log("pid", pid)
    console.log("addr", addr)
    const node = await server({ dbpath, jwk, hb, port: port2 })

    //const { request } = connect({ MODE: "mainnet", URL, device: "", signer })
    const _hb = new HB({ url: URL, jwk })
    let nonce = 0
    const json0 = await set(_hb, ["init", init_query], ++nonce, pid)
    const json = await set(_hb, q1, ++nonce, pid)
    const json2 = await set(_hb, q2, ++nonce, pid)
    const json3 = await get(_hb, ["get", "users"], pid)
    assert.deepEqual(json3.res, [bob])
    await wait(1000)
    node.stop()
    const node2 = await server({ dbpath, jwk, hb, port: port3 })
    await wait(3000)
    /*const { request: request2 } = connect({
      MODE: "mainnet",
      URL: URL2,
      device: "",
      signer,
      })*/
    const _hb2 = new HB({ url: URL2, jwk })
    const json3_2 = await get(_hb2, ["get", "users"], pid)
    assert.deepEqual(json3_2.res, [bob])
    node2.stop()
    await wait(3000)
    hbeam.kill()
  })

  it("should run a server", async () => {
    const port = 10001
    const port2 = 6364
    const hbeam = await new HyperBEAM({ port }).ready()
    await wait(5000)
    const hb = `http://localhost:${port}`
    const URL = `http://localhost:${port2}`

    const { pid, signer, jwk, addr, dbpath } = await deploy({ hb })
    console.log("pid", pid)
    console.log("addr", addr)

    const node = await server({ dbpath, jwk, hb, port: port2 })
    const _hb = new HB({ url: URL, jwk })
    let nonce = 0
    const json0 = await set(_hb, ["init", init_query], ++nonce, pid)
    const json = await set(_hb, q1, ++nonce, pid)
    const json2 = await set(_hb, q2, ++nonce, pid)
    const json3 = await get(_hb, ["get", "users"], pid)
    assert.deepEqual(json3.res, [bob])
    await wait(5000)
    const { db } = await recover({ pid, hb, dbpath: genDir(), jwk })
    assert.deepEqual(await db.get("users").val(), [bob])
    const { pid: pid2 } = await deploy({ hb })
    let nonce_2 = 0
    const json0_2 = await set(_hb, ["init", init_query], ++nonce_2, pid2)
    const json_2 = await set(_hb, q1, ++nonce_2, pid2)
    const json2_2 = await set(_hb, q3, ++nonce_2, pid2)
    const json3_2 = await get(_hb, ["get", "users"], pid2)
    assert.deepEqual(json3_2.res, [alice])
    node.stop()
    hbeam.kill()
  })
})

function to64(str) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(str))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function from64(str) {
  str = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(str.length + ((4 - (str.length % 4)) % 4), "=")
  return JSON.parse(decodeURIComponent(escape(atob(str))))
}

const checkZK = async ({ pid, hb }) => {
  const zkp = await zkjson({ pid, hb, dbpath: genDir(), port: 6365 })
  await wait(5000)
  const proof = await zkp.proof({ dir: "users", doc: "alice", path: "name" })
  console.log(proof)
  assert.equal(proof[proof.length - 2], "4")
  console.log("success!")
  await wait(3000)
  return zkp.server
}

const setup = async ({ pid, request }) => {
  let nonce = 0
  const json0 = await set(request, ["init", init_query], ++nonce, pid)
  const json = await set(request, q1, ++nonce, pid)
  const json2 = await set(request, q2, ++nonce, pid)
  const json3 = await get(request, ["get", "users"], pid)
  assert.deepEqual(json3.res, [bob])
  return { nonce }
}

const validateDB = async ({ hbeam, pid, hb, jwk }) => {
  const { pid: validate_pid } = await hbeam.spawn({
    "execution-device": "weavedb@1.0",
    db: pid,
  })
  await wait(5000)
  const dbpath2 = genDir()
  await validate({ pid, hb, dbpath: dbpath2, jwk, validate_pid })
  await wait(5000)
  const { slot } = await hbeam.schedule({
    pid: validate_pid,
    tags: { Action: "Query", Query: JSON.stringify(["users"]) },
  })
  const {
    results: { data },
  } = await hbeam.compute({ pid: validate_pid, slot })
  assert.deepEqual(data, [bob])
  return { validate_pid, dbpath2 }
}

describe("Validator", () => {
  it("should validate HB WAL", async () => {
    const { node, pid, hbeam, jwk, hb } = await deployHB({})
    const _hb = new HB({ url: "http://localhost:6364", jwk })
    let { nonce } = await setup({ pid, request: _hb })
    const { validate_pid, dbpath2 } = await validateDB({
      hbeam: hbeam.hb,
      pid,
      hb,
      jwk,
    })
    const json4 = await set(_hb, q3, ++nonce, pid)
    await wait(10000)
    await validate({ pid, hb, dbpath: dbpath2, jwk, validate_pid })
    await wait(5000)
    const { res } = await hbeam.hb.message({
      pid: validate_pid,
      tags: { Action: "Query", Query: JSON.stringify(["users"]) },
    })
    assert.deepEqual(res.results.data, [alice, bob])
    const zk_server = await checkZK({ pid: validate_pid, hb })
    console.log(
      await fetch("http://localhost:6365/zkp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dir: "users", doc: "alice", path: "name" }),
      }).then(r => r.json()),
    )
    zk_server.close()
    node.stop()
    hbeam.kill()
  })
})

describe("Wal", () => {
  it("should validate HB WAL", async () => {
    const { node, pid, hbeam, jwk, hb } = await deployHB({})
    const _hb = new HB({ url: "http://localhost:6364", jwk })
    let { nonce } = await setup({ pid, request: _hb })
    await wait(5000)
    const { wal } = await fetch(
      `http://localhost:6364/wal/${pid}?limit=1&order=desc`,
    ).then(r => r.json())
    assert.equal(2, wal[0].key[1])
    node.stop()
    hbeam.kill()
  })
})

describe("AOS", () => {
  it.skip("should serve AOS Legacynet", async () => {
    const port = 10001
    const sport = 5000
    const { node, pid, hbeam, jwk, hb } = await deployHB({ sport })
    const _hb = new HB({ url: "http://localhost:6364", jwk })
    let { nonce } = await setup({ pid, request: _hb })
    const _hbeam = new HB({ url: "http://localhost:10001", jwk })
    const { validate_pid, dbpath2 } = await validateDB({
      hbeam: _hbeam,
      pid,
      hb,
      jwk,
    })
    const src_data = `
local count = 0
Handlers.add("Hello", "Hello", function (msg)
  local data = Send({ Target = msg.DB, Action = "Query",  Query = msg.Query, __HyperBEAM__ = msg.HyperBEAM }).receive().Data
  msg.reply({ Data = data })
end)`
    const server_aos = new Server({ port: sport, log: true })
    let ao = await new AO({ port: sport }).init(mu.jwk)
    await ao.postScheduler({ url: `http://localhost:${sport + 3}` })
    const { p, pid: pid2 } = await ao.deploy({ src_data })
    const users = await p.m(
      "Hello",
      {
        DB: validate_pid,
        Query: JSON.stringify(["users"]),
        Action: "Hello",
        HyperBEAM: `http://localhost:${port}`,
      },
      { timeout: 3000, get: true },
    )
    assert.deepEqual(users, [bob])
    await wait(5000)
    server_aos.end()
    hbeam.kill()
  })
})
