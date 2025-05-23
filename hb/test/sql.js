import assert from "assert"
import { createPrivateKey } from "node:crypto"
import { DatabaseSync } from "node:sqlite"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import sql from "../src/sql.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import { connect, createSigner } from "@permaweb/aoconnect"
import { AO } from "wao"
import { open } from "lmdb"
import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"
import { sign, wait, init_query } from "./test-utils.js"
import kv from "../src/kv_sql.js"

const getKV = _sql => {
  const rand = Math.floor(Math.random() * 100000)
  const io = open({ path: `.db/kv.${rand}` })
  return kv(io, _sql, c => {})
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
describe("WeaveSQL", () => {
  it("should init", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "my-sql" })
    const rand = Math.floor(Math.random() * 100000)
    const _sql = new DatabaseSync(`.db/sql.${rand})}`)
    const db = sql(getKV(_sql), { sql: _sql })
      .write(await s.sign("init", init_query))
      .write(await s.sign("sql", create))
      .write(await s.sign("sql", insert))
      .write(await s.sign("sql", insert2))
      .write(await s.sign("sql", update))
      .write(await s.sign("sql", del))
      .write(await s.sign("sql", insert))
    assert.deepEqual(db.sql("SELECT * from users"), [
      { name: "Bob", age: 24, id: 3 },
    ])
  })
})
