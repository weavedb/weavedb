import assert from "assert"
import crypto from "crypto"
import { createPrivateKey } from "node:crypto"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { pdev, dev, of, pof, ka, pka } from "monade"
import wdb from "../src/db.js"
import queue from "../src/queue.js"
import { open } from "lmdb"
import { resolve } from "path"
import BPT from "../src/bpt.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import server from "../src/server.js"
import recover from "../src/recover.js"
import validate from "../src/validate.js"
import zkjson from "../src/zkjson.js"
import { spawn } from "child_process"
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
  HB as HBeam,
  sign,
} from "./test-utils.js"

import {
  put,
  mod,
  del,
  addIndex,
  getIndexes,
  removeIndex,
} from "../src/indexer.js"
import parseQuery from "../src/parser.js"
import {
  range,
  get as planner_get,
  ranges,
  pranges,
  doc,
} from "../src/planner.js"

import { connect, createSigner } from "@permaweb/aoconnect"
import { AO, HB } from "wao"
import { Server, mu } from "wao/test"
import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"
import kv from "../src/kv.js"
function computeContentDigest(bodyBuffer) {
  const digest = crypto.createHash("sha256").update(bodyBuffer).digest("base64")
  return `sha-256=:${digest}:`
}

const getKV = () => {
  const io = open({ path: genDir() })
  return kv(io, c => {})
}

describe("Monade", () => {
  it("should create a kleisli", async () => {
    const p1 = ka().map(n => n + 1)
    const p2 = pka().map(async n => n + 2)
    const p3 = pka().chain(p1.fn()).chain(p2)
    const f = pka()
      .chain(p1.fn())
      .map(n => n * 10)
      .chain(p3.fn())
    assert.equal(
      await pof(3)
        .chain(f.fn())
        .map(n => n * 3)
        .val(),
      129,
    )
  })
  it("should create a monad", async () => {
    const res = await pof(2).map(async x => x + 1)
    assert.equal(await res.val(), 3)
    assert.equal(await res.to(v => v + 5), 8)
    const res2 = of(2).map(x => x + 1)
    assert.equal(res2.val(), 3)
  })

  it("should inject custom methods", async () => {
    const db = dev(
      {
        set: (obj, x) => {
          obj.state.count += x
          return obj
        },
      },
      {
        get: (obj, x, y) => obj.state.count + x + y,
      },
    )
    const wdb = db({ state: { count: 2 } })
    assert.deepEqual(wdb.set(5).set(6).val(), { state: { count: 13 } })
    assert.equal(wdb.get(9, 10), 32)
    const wdb2 = db({ state: { count: 2 } })
    assert.equal(wdb2.set(5).set(6).get(1, 2), 16)
  })
})

describe("WeaveDB TPS", () => {
  const msg = i => {
    return {
      from: "me",
      q: ["set", { name: "users-" + i }, 2, i.toString()],
    }
  }

  const set = msg => obj => {
    const [op, ...rest] = msg.q
    const [data, dir, doc] = rest
    switch (op) {
      case "set":
        obj.state[dir] ??= {}
        obj.state[dir][doc] = data
        break
    }
    return obj
  }

  it("bare func tps (2.5 - 3.0 M)", async () => {
    let start = Date.now()
    let i = 0
    let obj = { env: {}, state: {} }
    while (Date.now() - start < 1000) set(msg(i++))(obj)
    console.log(i, "tps without monad")
  })

  it("full weavedb monad & kv tps (3.0 - 3.5 K)", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "db-1" })
    const allow = [["allow()"]]
    const db = wdb(getKV())
      .write(await s.sign("init", init_query))
      .write(await s.sign(...users_query))
    let last = 0
    let i = 0
    let qs = []
    while (i < 5000) {
      qs.push(
        await s.sign("set:user", { name: `Bob-${i}` }, "users", `bob-${i++}`),
      )
    }
    let start = Date.now()
    i = 0
    while (Date.now() - start < 1000) {
      db.write(qs[i++])
    }
    console.log(i, "tps with weavedb monad & kv")
  })

  it("bare monad tps (2.5 - 3.0 M)", async () => {
    let start = Date.now()
    let i = 0
    const db = of({ env: {}, state: {} })
    while (Date.now() - start < 1000) db.map(obj => set(msg(i++))(obj))
    console.log(i, "tps with bare monad")
  })
})

describe("KV", () => {
  it("should save data to kv", async () => {
    const io = open({ path: genDir() })
    const wkv = kv(io, c => {})
    let start = Date.now()
    let last = 0
    let i = 0
    let s = {}
    while (Date.now() - start < 1000) {
      wkv.put(`bob-${i}`, { name: `Bob_${i++}` })
      if (i % 3 === 0) {
        if (i % 6 === 0) wkv.reset()
        else wkv.commit().then(({ i, data }) => {})
      }
    }
    console.log(i)
    assert.deepEqual(wkv.get("bob-1"), { name: "Bob_1" })
    const wkv2 = kv(io)
    await wait(5000)
    assert.deepEqual(wkv2.get("bob-1"), { name: "Bob_1" })
  })
})
