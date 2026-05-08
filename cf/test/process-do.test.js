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
