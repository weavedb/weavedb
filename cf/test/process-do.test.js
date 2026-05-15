// ProcessDO routing + state-transition tests.
//
// Scope: routing (/status, /get, /set, unknown), uninitialized-DB gating,
// auth gating without exercising real signature verification. The full
// signed-request end-to-end flow is covered in PR 3 with Miniflare.
//
// Run: cd cf && npm test

import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { ProcessDO } from "../src/process-do.js"
import { mockState, newMockedDO } from "./mock-state.js"
import doKv from "../src/do-kv.js"

const env = {
  HB_URL: "http://localhost:10001",
  ADMIN_ONLY: "false",
  JWK: null,
}

async function readJson(res) {
  return JSON.parse(await res.text())
}

describe("ProcessDO: routing", () => {
  let state
  let p

  beforeEach(async () => {
    ;({ p, state } = await newMockedDO(env))
  })

  it("GET /status on a fresh DO returns initialized: false", async () => {
    const res = await p.fetch(
      new Request("http://do/status", { method: "GET" }),
    )
    assert.equal(res.status, 200)
    const j = await readJson(res)
    assert.equal(j.success, true)
    assert.equal(j.initialized, false)
  })

  it("returns 404 for unknown paths", async () => {
    const res = await p.fetch(new Request("http://do/foo", { method: "GET" }))
    assert.equal(res.status, 404)
    const j = await readJson(res)
    assert.equal(j.success, false)
  })

  it("GET /get on uninitialized DB returns 400", async () => {
    const res = await p.fetch(
      new Request("http://do/get?query=" + encodeURIComponent('["get","posts"]'), {
        method: "GET",
      }),
    )
    assert.equal(res.status, 400)
    const j = await readJson(res)
    assert.equal(j.success, false)
    assert.match(j.err, /not initialized/)
  })

  it("POST /set with invalid signature returns 401", async () => {
    const res = await p.fetch(
      new Request("http://do/set", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ q: "unsigned" }),
      }),
    )
    assert.equal(res.status, 401)
    const j = await readJson(res)
    assert.equal(j.success, false)
    assert.match(j.err, /invalid signature/)
  })

  it("GET /zkp-inputs on uninitialized DB returns 400", async () => {
    const res = await p.fetch(
      new Request("http://do/zkp-inputs?dir=users&doc=alice", { method: "GET" }),
    )
    assert.equal(res.status, 400)
    const j = await readJson(res)
    assert.equal(j.success, false)
    assert.match(j.err, /not initialized/)
  })
})

describe("ProcessDO: /zkp-inputs handler", () => {
  let p

  beforeEach(async () => {
    const result = await newMockedDO(env)
    p = result.p
    p.io.put("__cf_meta__/initialized", true)
    p.io.put(["_", "users"], { index: 3, schema: { type: "object" }, auth: [] })
    p.io.put(["users", "alice"], { name: "Alice", age: 30 })
    await p.io.flush()
  })

  it("returns inputs for a valid dir/doc/path", async () => {
    const res = await p.fetch(
      new Request("http://do/zkp-inputs?dir=users&doc=alice&path=name", {
        method: "GET",
      }),
    )
    assert.equal(res.status, 200)
    const j = await readJson(res)
    assert.equal(j.success, true)
    assert.equal(j.inputs.col_key, 3)
    assert.equal(j.inputs.json.length, 256)
    assert.equal(j.inputs.path.length, 4)
    assert.equal(j.inputs.val.length, 8)
    assert.equal(j.meta.dir, "users")
    assert.equal(j.meta.doc, "alice")
    assert.equal(j.meta.complete, false)
  })

  it("missing dir returns 400", async () => {
    const res = await p.fetch(
      new Request("http://do/zkp-inputs?doc=alice&path=name", { method: "GET" }),
    )
    assert.equal(res.status, 400)
    const j = await readJson(res)
    assert.match(j.err, /dir is required/)
  })

  it("invalid query json returns 400", async () => {
    const res = await p.fetch(
      new Request("http://do/zkp-inputs?dir=users&doc=alice&query=NOT_JSON", {
        method: "GET",
      }),
    )
    assert.equal(res.status, 400)
    const j = await readJson(res)
    assert.match(j.err, /invalid query json/)
  })

  it("invalid params json returns 400", async () => {
    const res = await p.fetch(
      new Request("http://do/zkp-inputs?dir=users&doc=alice&params={broken", {
        method: "GET",
      }),
    )
    assert.equal(res.status, 400)
    const j = await readJson(res)
    assert.match(j.err, /invalid params json/)
  })

  it("custom params override defaults via query string", async () => {
    const params = JSON.stringify({ size_path: 32 })
    const res = await p.fetch(
      new Request(
        `http://do/zkp-inputs?dir=users&doc=alice&path=name&params=${encodeURIComponent(params)}`,
        { method: "GET" },
      ),
    )
    assert.equal(res.status, 200)
    const j = await readJson(res)
    assert.equal(j.inputs.path.length, 32)
    assert.equal(j.meta.params.size_path, 32)
  })

  it("accepts header form of dir/doc/path", async () => {
    const res = await p.fetch(
      new Request("http://do/zkp-inputs", {
        method: "GET",
        headers: { dir: "users", doc: "alice", path: "name" },
      }),
    )
    assert.equal(res.status, 200)
    const j = await readJson(res)
    assert.equal(j.success, true)
  })
})

describe("ProcessDO: state mechanics", () => {
  it("ensureDB short-circuits when db is already set", async () => {
    const { p } = await newMockedDO(env)
    const dbRef = p.db
    await p.ensureDB()
    assert.equal(p.db, dbRef, "ensureDB must not overwrite an existing db")
  })

  it("concurrent fetches share the same initPromise (no race-construct)", async () => {
    // With newMockedDO, db is already set, so all fetches see the same db.
    // This validates the routing entry path more than ensureDB itself; the
    // real concurrent-construction race is exercised in PR 3 with Miniflare.
    const { p } = await newMockedDO(env)
    const reqs = Array.from({ length: 8 }, () =>
      p.fetch(new Request("http://do/status", { method: "GET" })),
    )
    const responses = await Promise.all(reqs)
    for (const res of responses) {
      assert.equal(res.status, 200)
    }
  })

  it("initialized flag persists across DO restart (same storage)", async () => {
    const { p: p1, state } = await newMockedDO(env)
    p1.io.put("__cf_meta__/initialized", true)
    p1.io.put("__cf_meta__/owner", "addr-x")
    await p1.io.flush()

    // Simulate restart: new DO instance, same storage.
    const p2 = new ProcessDO(state, env)
    p2.io = await doKv(state.storage)
    p2.db = p1.db
    p2.initPromise = Promise.resolve()
    const res = await p2.fetch(
      new Request("http://do/status", { method: "GET" }),
    )
    const j = await readJson(res)
    assert.equal(j.initialized, true)
    assert.equal(j.owner, "addr-x")
  })
})
