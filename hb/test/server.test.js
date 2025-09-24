import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { of, pof } from "monade"
import { queue, kv, db as wdb } from "../../core/src/index.js"
import { DB } from "../../sdk/src/index.js"
import { open } from "lmdb"
import { resolve } from "path"
import BPT from "../../core/src/bpt.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import server from "../src/server.js"
import recover from "../src/recover.js"
import validate from "../src/validate.js"
import validate2 from "../src/validate2.js"
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

const checkZK = async ({ pid, hb }) => {
  const dir = genDir() + "/" + pid
  const zkp = await zkjson({ pid, hb, dbpath: dir, port: 6365 })
  await wait(5000)
  const proof = await zkp.proof({ dir: "users", doc: "A", path: "name" })
  console.log(proof)
  console.log("success!")
  await wait(3000)
  return zkp.server
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
  console.log("validating.....................................................")
  console.log(data)
  return { validate_pid, dbpath2 }
}

const validateDB2 = async ({ hbeam, pid, hb, jwk }) => {
  const { pid: validate_pid } = await hbeam.spawn({
    "execution-device": "weavedb@1.0",
    db: pid,
  })
  await wait(5000)
  const dbpath2 = genDir()
  await validate2({ pid, hb, dbpath: dbpath2, jwk, validate_pid })
  await wait(5000)
  const { slot } = await hbeam.schedule({
    pid: validate_pid,
    tags: { Action: "Query", Query: JSON.stringify(["users"]) },
  })
  const {
    results: { data },
  } = await hbeam.compute({ pid: validate_pid, slot })
  console.log("validating.....................................................")
  console.log(data)
  return { validate_pid, dbpath2 }
}

describe("Server", () => {
  it("should run a server", async () => {
    const hbeam = await new HyperBEAM({}).ready()
    await wait(5000)
    const dbpath = genDir()
    const jwk = hbeam.jwk
    const node = await server({ dbpath, jwk })
    const db = new DB({ jwk })
    const pid = await db.spawn()
    const status = await fetch("http://localhost:6364/status").then(r =>
      r.json(),
    )
    assert.deepEqual(status.processes, [pid])
    await db.admin("remove_db", { id: pid })
    const status2 = await fetch("http://localhost:6364/status").then(r =>
      r.json(),
    )
    assert.deepEqual(status2.processes, [])
    await wait(5000)
    node.stop()
    hbeam.kill()
  })

  it.only("should run multiple zk proovers", async () => {
    const hbeam = await new HyperBEAM({}).ready()
    await wait(5000)
    const dbpath = genDir()
    const jwk = hbeam.jwk
    const hb = `http://localhost:10001`
    const node = await server({ dbpath, jwk, hb })

    const db = new DB({ jwk })
    const pid = await db.spawn()
    await db.mkdir({
      name: "users",
      schema: { type: "object" },
      auth: [["add", [["allow()"]]]],
    })
    await db.set("add", { name: "Bob" }, "users")

    const db2 = new DB({ jwk })
    const pid2 = await db2.spawn()
    await db2.mkdir({
      name: "users",
      schema: { type: "object" },
      auth: [["add", [["allow()"]]]],
    })
    await db2.set("add", { name: "Alice" }, "users")

    const { validate_pid: validate_pid2 } = await validateDB2({
      hbeam: hbeam.hb,
      pid: pid2,
      jwk: hbeam.jwk,
      hb,
    })
    const { validate_pid } = await validateDB({
      hbeam: hbeam.hb,
      pid,
      jwk: hbeam.jwk,
      hb,
    })

    const zk_server = await checkZK({ pid: validate_pid, hb })
    const zk_server2 = await checkZK({ pid: validate_pid2, hb })
    await wait(5000)
    zk_server.close()
    zk_server2.close()
    node.stop()
    hbeam.kill()
  })
})
