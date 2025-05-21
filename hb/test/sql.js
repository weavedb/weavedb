import assert from "assert"
import { createPrivateKey } from "node:crypto"
import { DatabaseSync } from "node:sqlite"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import sql from "../src/sql.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import { connect, createSigner } from "@permaweb/aoconnect"
import { AO } from "wao"
import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"

import kv from "../src/kv-sql.js"

class sign {
  constructor({ jwk }) {
    this.jwk = jwk
    this.nonce = 0
    this.signer = createHttpSigner(
      createPrivateKey({ key: jwk, format: "jwk" }),
      "rsa-pss-sha512",
      jwk.n,
    )
  }
  async sign(...query) {
    const msg = await httpbis.signMessage(
      { key: this.signer, fields: ["query", "nonce"] },
      {
        headers: {
          query: JSON.stringify(query),
          nonce: Number(++this.nonce).toString(),
        },
      },
    )
    return [
      ...query,
      {
        nonce: Number(this.nonce).toString(),
        signature: msg.headers.Signature,
        "signature-input": msg.headers["Signature-Input"],
      },
    ]
  }
}

const getKV = () => {
  const io = new DatabaseSync(`.db/mydb.${Math.floor(Math.random() * 100000)}`)
  return kv(io, c => {})
}

const create = `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL
  )`

const insert = `INSERT INTO users (name, age) VALUES ('Bob', 24)`

describe("WeaveSQL", () => {
  it("should init", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk })
    const db = sql(getKV())
      .set(...(await s.sign(create)))
      .set(...(await s.sign(insert)))

    assert.deepEqual(db.get("SELECT * from users")[0], {
      id: 1,
      name: "Bob",
      age: 24,
    })
  })
})
