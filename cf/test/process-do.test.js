// ProcessDO routing + state-transition tests.
//
// Scope: routing (/status, /get, /set, unknown), uninitialized-DB gating,
// auth gating without exercising real signature verification. The full
// signed-request end-to-end flow is covered in PR 3 with Miniflare.
//
// Run: cd cf && npm test

import { describe, it, beforeEach, afterEach } from "node:test"
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

  describe("with VALIDATOR_URL set (sidecar proxy mode)", () => {
    let realFetch
    let fetchCalls
    beforeEach(() => {
      realFetch = global.fetch
      fetchCalls = []
    })
    afterEach(() => {
      global.fetch = realFetch
    })

    it("proxies the request to env.VALIDATOR_URL", async () => {
      global.fetch = async (url, opts) => {
        fetchCalls.push({ url: String(url), opts })
        return new Response(
          JSON.stringify({
            success: true,
            inputs: {
              json: ["1", "2"],
              path: ["p1"],
              val: ["v1"],
              key: "key0",
              col_key: 3,
              root: "root123",
              col_root: "col456",
              siblings: ["s1", "s2"],
              col_siblings: ["cs1"],
            },
            meta: { complete: true, zkhash: "h" },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        )
      }
      p.env = { ...env, VALIDATOR_URL: "https://prover.example.com:6365" }
      p.io.put("__cf_meta__/pid", "pid-zkp")
      await p.io.flush()
      const res = await p.fetch(
        new Request("http://do/zkp-inputs?dir=users&doc=alice&path=name", {
          method: "GET",
        }),
      )
      assert.equal(res.status, 200)
      assert.equal(fetchCalls.length, 1)
      const u = new URL(fetchCalls[0].url)
      assert.equal(u.origin, "https://prover.example.com:6365")
      assert.equal(u.pathname, "/~weavedb@1.0/zkp-inputs")
      assert.equal(u.searchParams.get("dir"), "users")
      assert.equal(u.searchParams.get("doc"), "alice")
      assert.equal(u.searchParams.get("path"), "name")
      assert.equal(u.searchParams.get("id"), "pid-zkp")
      const j = await readJson(res)
      // Proxied: client sees the sidecar's full response (with siblings).
      assert.equal(j.success, true)
      assert.equal(j.meta.complete, true)
      assert.equal(j.inputs.root, "root123")
      assert.deepEqual(j.inputs.siblings, ["s1", "s2"])
    })

    it("returns 502 when the validator is unreachable", async () => {
      global.fetch = async () => {
        throw new Error("ECONNREFUSED")
      }
      p.env = { ...env, VALIDATOR_URL: "https://prover.example.com" }
      const res = await p.fetch(
        new Request("http://do/zkp-inputs?dir=users&doc=alice&path=name", {
          method: "GET",
        }),
      )
      assert.equal(res.status, 502)
      const j = await readJson(res)
      assert.match(j.err, /validator unreachable/)
    })

    it("forwards the validator's non-2xx response verbatim", async () => {
      global.fetch = async () =>
        new Response(
          JSON.stringify({ success: false, err: "no compaction for pid" }),
          { status: 404 },
        )
      p.env = { ...env, VALIDATOR_URL: "https://prover.example.com" }
      const res = await p.fetch(
        new Request("http://do/zkp-inputs?dir=users&doc=alice", {
          method: "GET",
        }),
      )
      assert.equal(res.status, 404)
      const j = await readJson(res)
      assert.match(j.err, /no compaction/)
    })
  })
})

describe("ProcessDO: /replay handler", () => {
  let p
  let bucket
  let archive

  beforeEach(async () => {
    // Import test fixtures lazily to keep the top of the file lean.
    const { MockR2Bucket } = await import("./mock-r2.js")
    const { R2Archive } = await import("../src/r2-archive.js")
    bucket = new MockR2Bucket()
    archive = new R2Archive(bucket)

    const result = await newMockedDO({ ...env, BUNDLES: bucket })
    p = result.p
    p._setR2Archive(archive)
    p.io.put("__cf_meta__/initialized", true)
    p.io.put("__cf_meta__/pid", "pid-replay")
    await p.io.flush()

    // Plant 5 archived bundles. Each bundle "deserializes" to an array
    // of one fake entry — we just check the replay returns them in order.
    const { serializeBundle } = await import("../src/wal-do.js")
    for (let slot = 0; slot < 5; slot++) {
      const buf = serializeBundle([
        { path: null, headers: {}, body: `b${slot}`, hashpath: `h${slot}`, slot, ts: 1000 + slot },
      ])
      await archive.archiveBundle({
        pid: "pid-replay",
        slot,
        zkhash: `sha256:${slot.toString().repeat(16)}`,
        buf,
        ts: 1000 + slot,
      })
    }
  })

  it("returns 503 when R2 binding is missing", async () => {
    p._setR2Archive(null)
    p.env = { ...env, BUNDLES: undefined }
    p._r2Archive = null
    const res = await p.fetch(
      new Request("http://do/replay", { method: "GET" }),
    )
    assert.equal(res.status, 503)
    const j = await readJson(res)
    assert.match(j.err, /R2 archive not configured/)
  })

  it("returns 400 when pid is not initialized", async () => {
    // Clear pid
    p.io.put("__cf_meta__/pid", null)
    const res = await p.fetch(
      new Request("http://do/replay", { method: "GET" }),
    )
    assert.equal(res.status, 400)
    const j = await readJson(res)
    assert.match(j.err, /pid not initialized/)
  })

  it("streams all bundles as NDJSON", async () => {
    const res = await p.fetch(
      new Request("http://do/replay", { method: "GET" }),
    )
    assert.equal(res.status, 200)
    assert.equal(res.headers.get("content-type"), "application/x-ndjson")
    assert.equal(res.headers.get("x-replay-count"), "5")
    const text = await res.text()
    const lines = text.trim().split("\n")
    assert.equal(lines.length, 5)
    for (let i = 0; i < 5; i++) {
      const obj = JSON.parse(lines[i])
      assert.equal(obj.slot, i)
      assert.equal(obj.ts, 1000 + i)
      assert.ok(obj.zkhash.startsWith("sha256:"))
      assert.equal(obj.bundle.length, 1)
      assert.equal(obj.bundle[0].body, `b${i}`)
    }
  })

  it("filters by from (inclusive)", async () => {
    const res = await p.fetch(
      new Request("http://do/replay?from=3", { method: "GET" }),
    )
    assert.equal(res.status, 200)
    const lines = (await res.text()).trim().split("\n")
    assert.equal(lines.length, 2)
    assert.equal(JSON.parse(lines[0]).slot, 3)
    assert.equal(JSON.parse(lines[1]).slot, 4)
  })

  it("filters by to (inclusive)", async () => {
    const res = await p.fetch(
      new Request("http://do/replay?to=2", { method: "GET" }),
    )
    const lines = (await res.text()).trim().split("\n")
    assert.equal(lines.length, 3)
    assert.equal(JSON.parse(lines[0]).slot, 0)
    assert.equal(JSON.parse(lines[2]).slot, 2)
  })

  it("filters by both from and to", async () => {
    const res = await p.fetch(
      new Request("http://do/replay?from=1&to=3", { method: "GET" }),
    )
    const lines = (await res.text()).trim().split("\n")
    assert.equal(lines.length, 3)
    assert.deepEqual(
      lines.map(l => JSON.parse(l).slot),
      [1, 2, 3],
    )
  })

  it("honors limit", async () => {
    const res = await p.fetch(
      new Request("http://do/replay?limit=2", { method: "GET" }),
    )
    const lines = (await res.text()).trim().split("\n")
    assert.equal(lines.length, 2)
    assert.deepEqual(
      lines.map(l => JSON.parse(l).slot),
      [0, 1],
    )
  })

  it("empty range returns empty body", async () => {
    const res = await p.fetch(
      new Request("http://do/replay?from=100", { method: "GET" }),
    )
    assert.equal(res.status, 200)
    assert.equal(res.headers.get("x-replay-count"), "0")
    assert.equal((await res.text()).length, 0)
  })

  it("preserves slot order across the response", async () => {
    // Plant an extra bundle out-of-order in R2 (a future slot) and verify
    // that the replay still walks in slot-numeric order.
    const { serializeBundle } = await import("../src/wal-do.js")
    const futureBuf = serializeBundle([
      { path: null, headers: {}, body: "future", hashpath: "h99", slot: 99, ts: 9999 },
    ])
    await archive.archiveBundle({
      pid: "pid-replay",
      slot: 99,
      zkhash: "sha256:future",
      buf: futureBuf,
      ts: 9999,
    })
    const res = await p.fetch(
      new Request("http://do/replay", { method: "GET" }),
    )
    const slots = (await res.text())
      .trim()
      .split("\n")
      .map(l => JSON.parse(l).slot)
    assert.deepEqual(slots, [0, 1, 2, 3, 4, 99])
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
