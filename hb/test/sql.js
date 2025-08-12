import assert from "assert"
import zkjson from "../src/zkjson.js"
import { createPrivateKey } from "node:crypto"
import { DatabaseSync } from "node:sqlite"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { sql, kv } from "../../core/src/index.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import { connect, createSigner } from "@permaweb/aoconnect"
import { AO, HB } from "wao"
import { open } from "lmdb"
import validate from "../src/validate.js"
import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"
import {
  genDir,
  sign,
  wait,
  init_query,
  deployHB,
  set,
  get,
} from "./test-utils.js"

const getKV = ({ dbpath }) => {
  const io = open({ path: dbpath })
  return kv(io, c => {})
}

const create = `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL
  )`

const insert = `INSERT INTO users (name, age) VALUES ('Bob', 24)`
const insert2 = `INSERT INTO users (name, age) VALUES ('Alice', 24)`
const update = `UPDATE users SET age = 25 WHERE age = 24`
const del = `DELETE from users WHERE age = 25`

const setup = async ({ pid, request }) => {
  let nonce = 0
  const json0 = await set(request, ["init", init_query], ++nonce, pid)
  const json = await set(request, ["sql", create], ++nonce, pid)
  const json2 = await set(request, ["sql", insert], ++nonce, pid)
  const json3 = await get(request, ["SELECT * from users"], pid)
  assert.deepEqual(json3.res, [{ id: 1, name: "Bob", age: 24 }])
  return { nonce }
}

const validateDB = async ({ hbeam, pid, hb, jwk }) => {
  const { pid: validate_pid } = await hbeam.spawn({
    "execution-device": "weavedb@1.0",
    db: pid,
  })
  await wait(5000)
  const dbpath2 = genDir()
  await validate({ pid, hb, dbpath: dbpath2, jwk, validate_pid, type: "sql" })
  await wait(5000)
  const { slot } = await hbeam.schedule({
    pid: validate_pid,
    tags: { Action: "Query", Query: JSON.stringify(["SELECT * from users"]) },
  })
  const {
    results: { data },
  } = await hbeam.compute({ pid: validate_pid, slot })
  assert.deepEqual(data, [{ id: 1, age: 24, name: "Bob" }])
  return { validate_pid, dbpath2 }
}

const checkZK = async ({ pid, hb, sql }) => {
  const zkp = await zkjson({ pid, hb, dbpath: genDir(), sql, port: 6365 })
  await wait(5000)
  const proof = await zkp.proof({ dir: "users", doc: "1", path: "name" })
  console.log(proof)
  assert.equal(proof[proof.length - 2], "4")
  console.log("success!")
  await wait(3000)
}

describe("WeaveSQL", () => {
  it("should init", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "my-sql" })
    const rand = Math.floor(Math.random() * 100000)
    const _sql = new DatabaseSync(`.db/sql.${rand})}`)
    const db = sql(getKV({ dbpath: `.db/kv.${rand}` }), { sql: _sql })
    await db.write(await s.sign("init", init_query))
    await db.write(await s.sign("sql", create))
    await db.write(await s.sign("sql", insert))
    await db.write(await s.sign("sql", insert2))
    await db.write(await s.sign("sql", update))
    await db.write(await s.sign("sql", del))
    await db.write(await s.sign("sql", insert))
    assert.deepEqual(await db.sql("SELECT * from users").val(), [
      { name: "Bob", age: 24, id: 3 },
    ])
  })
  it("should validate HB WAL", async () => {
    const { node, pid, hbeam, jwk, hb } = await deployHB({
      type: "sql",
    })
    const _hb = new HB({ url: "http://localhost:6364", jwk })
    let { nonce } = await setup({ pid, request: _hb })
    const { validate_pid, dbpath2 } = await validateDB({
      hbeam: hbeam.hb,
      pid,
      hb,
      jwk,
    })
    await wait(10000)
    const rand2 = Math.floor(Math.random() * 100000)
    const _sql2 = new DatabaseSync(`.db/sql.${rand2})}`)
    await checkZK({ pid: validate_pid, hb, sql: _sql2 })
    assert.deepEqual(_sql2.prepare("SELECT * from users").all(), [
      { id: 1, name: "Bob", age: 24 },
    ])
    node.stop()
    hbeam.kill()
  })
})
