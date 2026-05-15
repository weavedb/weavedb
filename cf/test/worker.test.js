// Worker routing tests.
//
// Scope: top-level URL → DO routing, /status node info, header validation.
// The DO itself is mocked here — we're testing the Worker's dispatcher,
// not the pipeline. Pipeline tests live in process-do.test.js (mocked) and
// PR 3's Miniflare integration.

import { describe, it } from "node:test"
import assert from "node:assert/strict"
import worker from "../src/worker.js"
import { mockNamespace } from "./mock-state.js"

const baseEnv = {
  HB_URL: "https://hb.wdb.ae:10002",
  JWK: null,
  ADMIN_ONLY: "false",
}

async function readJson(res) {
  return JSON.parse(await res.text())
}

describe("Worker: /status", () => {
  it("returns node info", async () => {
    const env = { ...baseEnv, PROCESS_DO: mockNamespace() }
    const res = await worker.fetch(
      new Request("http://w/status", { method: "GET" }),
      env,
      {},
    )
    assert.equal(res.status, 200)
    const j = await readJson(res)
    assert.equal(j.name, "WeaveDB")
    assert.equal(j["wal-url"], "https://hb.wdb.ae:10002")
    assert.equal(j["wal-type"], "HyperBEAM")
    assert.equal(j.status, "ok")
  })
})

describe("Worker: WeaveDB routes", () => {
  it("returns 400 when id header is missing on /get", async () => {
    const env = { ...baseEnv, PROCESS_DO: mockNamespace() }
    const res = await worker.fetch(
      new Request("http://w/~weavedb@1.0/get?query=" + encodeURIComponent('["get","posts"]'), {
        method: "GET",
      }),
      env,
      {},
    )
    assert.equal(res.status, 400)
    const j = await readJson(res)
    assert.match(j.err, /missing id header/)
  })

  it("returns 400 when id header is missing on /set", async () => {
    const env = { ...baseEnv, PROCESS_DO: mockNamespace() }
    const res = await worker.fetch(
      new Request("http://w/~weavedb@1.0/set", { method: "POST", body: "" }),
      env,
      {},
    )
    assert.equal(res.status, 400)
    const j = await readJson(res)
    assert.match(j.err, /missing id header/)
  })

  it("forwards /get with id header to the per-pid DO", async () => {
    let seenName = null
    let seenInnerPath = null
    const env = {
      ...baseEnv,
      PROCESS_DO: mockNamespace(async (req, id) => {
        seenName = id.name
        seenInnerPath = new URL(req.url).pathname
        return new Response(JSON.stringify({ ok: true }), {
          headers: { "content-type": "application/json" },
        })
      }),
    }
    const res = await worker.fetch(
      new Request("http://w/~weavedb@1.0/get?query=x", {
        method: "GET",
        headers: { id: "pid-123" },
      }),
      env,
      {},
    )
    assert.equal(res.status, 200)
    assert.equal(seenName, "pid-123", "DO selected by pid header")
    assert.equal(seenInnerPath, "/get", "Worker rewrites public route to /get")
  })

  it("forwards /set with id header to the per-pid DO", async () => {
    let seenName = null
    let seenInnerPath = null
    const env = {
      ...baseEnv,
      PROCESS_DO: mockNamespace(async (req, id) => {
        seenName = id.name
        seenInnerPath = new URL(req.url).pathname
        return new Response(JSON.stringify({ success: true }), {
          headers: { "content-type": "application/json" },
        })
      }),
    }
    const res = await worker.fetch(
      new Request("http://w/~weavedb@1.0/set", {
        method: "POST",
        headers: { id: "pid-abc" },
        body: "payload",
      }),
      env,
      {},
    )
    assert.equal(res.status, 200)
    assert.equal(seenName, "pid-abc")
    assert.equal(seenInnerPath, "/set")
  })

  it("returns 404 for unknown paths", async () => {
    const env = { ...baseEnv, PROCESS_DO: mockNamespace() }
    const res = await worker.fetch(
      new Request("http://w/totally-unknown", { method: "GET" }),
      env,
      {},
    )
    assert.equal(res.status, 404)
  })

  it("forwards /zkp-inputs with id header to the per-pid DO", async () => {
    let seenName = null
    let seenInnerPath = null
    let seenSearch = null
    const env = {
      ...baseEnv,
      PROCESS_DO: mockNamespace(async (req, id) => {
        seenName = id.name
        const u = new URL(req.url)
        seenInnerPath = u.pathname
        seenSearch = u.search
        return new Response(
          JSON.stringify({ success: true, inputs: {}, meta: {} }),
          { headers: { "content-type": "application/json" } },
        )
      }),
    }
    const res = await worker.fetch(
      new Request("http://w/~weavedb@1.0/zkp-inputs?dir=users&doc=alice&path=name", {
        method: "GET",
        headers: { id: "pid-zkp" },
      }),
      env,
      {},
    )
    assert.equal(res.status, 200)
    assert.equal(seenName, "pid-zkp")
    assert.equal(seenInnerPath, "/zkp-inputs")
    assert.match(seenSearch, /dir=users/)
    assert.match(seenSearch, /doc=alice/)
  })

  it("returns 400 when id header is missing on /zkp-inputs", async () => {
    const env = { ...baseEnv, PROCESS_DO: mockNamespace() }
    const res = await worker.fetch(
      new Request("http://w/~weavedb@1.0/zkp-inputs?dir=users&doc=alice", {
        method: "GET",
      }),
      env,
      {},
    )
    assert.equal(res.status, 400)
    const j = await readJson(res)
    assert.match(j.err, /missing id header/)
  })
})
