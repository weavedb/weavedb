import assert from "assert"
import { createPrivateKey } from "node:crypto"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import vec from "../src/vec.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import { connect, createSigner } from "@permaweb/aoconnect"
import { AO } from "wao"
import * as lancedb from "@lancedb/lancedb"
import { init_query, wait, sign } from "./test-utils.js"
import { open } from "lmdb"
import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"

import kv from "../src/kv-vec.js"

const getKV = async () => {
  const rand = Math.floor(Math.random() * 100000)
  const io = open({ path: `.db/kv.${rand}` })
  const _vec = await lancedb.connect(`.db/vec.${rand}`)
  return kv(io, _vec, c => {})
}

describe("WeaveVec", () => {
  it.only("should init", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "myvec" })
    const db = vec(await getKV())
      .write(await s.sign("init", init_query))
      .write(
        await s.sign("createTable", "vectors", [
          { id: 1, vector: [0.1, 0.2], item: "foo", price: 10 },
        ]),
      )
    await wait(100)
    db.write(
      await s.sign("addData", "vectors", [
        { id: 2, vector: [1.1, 1.2], item: "bar", price: 50 },
      ]),
    )
    await wait(100)
    console.log(await db.search("vectors", [0.1, 0.3], 2))
    console.log(await db.query("vectors", "price <= 10"))
  })
})
