import assert from "assert"
import { createPrivateKey } from "node:crypto"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import vec from "../src/vec.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import { connect, createSigner } from "@permaweb/aoconnect"
import { AO } from "wao"
import * as lancedb from "@lancedb/lancedb"
import { wait } from "./test-utils.js"
import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"

import kv from "../src/kv-vec.js"

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

const getKV = async () => {
  const io = await lancedb.connect(
    `.db/mydb.${Math.floor(Math.random() * 100000)}`,
  )
  return kv(io, c => {})
}

describe("WeaveVec", () => {
  it.only("should init", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk })
    const db = vec(await getKV()).create(
      ...(await s.sign("vectors", [
        { id: 1, vector: [0.1, 0.2], item: "foo", price: 10 },
      ])),
    )
    await wait(100)
    db.add(
      ...(await s.sign("vectors", [
        { id: 2, vector: [1.1, 1.2], item: "bar", price: 50 },
      ])),
    )
    await wait(100)
    console.log(await db.search("vectors", [0.1, 0.3], 2))
    console.log(await db.query("vectors", "price <= 10"))
  })
})
