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

  it("forwards /replay with id header to the per-pid DO", async () => {
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
        return new Response("", {
          status: 200,
          headers: {
            "content-type": "application/x-ndjson",
            "x-replay-count": "0",
          },
        })
      }),
    }
    const res = await worker.fetch(
      new Request("http://w/~weavedb@1.0/replay?from=5&to=10", {
        method: "GET",
        headers: { id: "pid-replay" },
      }),
      env,
      {},
    )
    assert.equal(res.status, 200)
    assert.equal(seenName, "pid-replay")
    assert.equal(seenInnerPath, "/replay")
    assert.match(seenSearch, /from=5/)
    assert.match(seenSearch, /to=10/)
  })

  it("returns 400 when id header is missing on /replay", async () => {
    const env = { ...baseEnv, PROCESS_DO: mockNamespace() }
    const res = await worker.fetch(
      new Request("http://w/~weavedb@1.0/replay?from=0", { method: "GET" }),
      env,
      {},
    )
    assert.equal(res.status, 400)
    const j = await readJson(res)
    assert.match(j.err, /missing id header/)
  })
})

describe("Worker: /~scheduler@1.0/schedule (HB compat)", () => {
  it("returns 503 when BUNDLES binding is missing", async () => {
    const env = { ...baseEnv, PROCESS_DO: mockNamespace() }
    const res = await worker.fetch(
      new Request("http://w/~scheduler@1.0/schedule?target=p1&from=0&to=10", {
        method: "GET",
      }),
      env,
      {},
    )
    assert.equal(res.status, 503)
  })

  it("returns 400 when target is missing", async () => {
    const { MockR2Bucket } = await import("./mock-r2.js")
    const env = { ...baseEnv, PROCESS_DO: mockNamespace(), BUNDLES: new MockR2Bucket() }
    const res = await worker.fetch(
      new Request("http://w/~scheduler@1.0/schedule", { method: "GET" }),
      env,
      {},
    )
    assert.equal(res.status, 400)
  })

  it("returns assignments in HB-compat shape", async () => {
    const { MockR2Bucket } = await import("./mock-r2.js")
    const { R2Archive } = await import("../src/r2-archive.js")
    const { serializeBundle } = await import("../src/wal-do.js")
    const bucket = new MockR2Bucket()
    const archive = new R2Archive(bucket)
    const buf = serializeBundle([
      { path: null, headers: { signature: "s0" }, body: "{}", hashpath: "h0", slot: 0, ts: 1 },
      { path: null, headers: { signature: "s1" }, body: "{}", hashpath: "h1", slot: 1, ts: 2 },
    ])
    await archive.archiveBundle({
      pid: "pid-hb",
      slot: 1,
      zkhash: "sha256:x",
      buf,
      ts: 2,
    })
    const env = { ...baseEnv, PROCESS_DO: mockNamespace(), BUNDLES: bucket }
    const res = await worker.fetch(
      new Request("http://w/~scheduler@1.0/schedule?target=pid-hb", {
        method: "GET",
      }),
      env,
      {},
    )
    assert.equal(res.status, 200)
    const j = await res.json()
    assert.ok(j.assignments)
    assert.deepEqual(Object.keys(j.assignments).sort(), ["0", "1"])
    const data = JSON.parse(j.assignments["0"].body.data)
    assert.equal(data[0].slot, 0)
  })
})

describe("Worker: scheduled() anchor cron", () => {
  it("no-ops without BUNDLES binding", async () => {
    // No throw, no fetch.
    await worker.scheduled({}, { ...baseEnv }, { waitUntil: p => p })
  })

  // Capture every promise handed to ctx.waitUntil so the test can await
  // them — workerd's real waitUntil extends the lifetime beyond
  // scheduled()'s return, which is also the actual semantics we want
  // to test.
  function collectingCtx() {
    const promises = []
    return {
      waitUntil(p) {
        promises.push(p)
      },
      drain: () => Promise.all(promises),
    }
  }

  it("dry-runs anchor for each pid when ANCHOR_URL is absent", async () => {
    const { MockR2Bucket } = await import("./mock-r2.js")
    const { R2Archive } = await import("../src/r2-archive.js")
    const bucket = new MockR2Bucket()
    const archive = new R2Archive(bucket)
    for (const pid of ["pid-x", "pid-y"]) {
      await archive.archiveBundle({
        pid,
        slot: 0,
        zkhash: `sha256:${pid}`,
        buf: new Uint8Array(),
      })
    }
    // Capture console.log to confirm the dry-run path was exercised.
    const logs = []
    const realLog = console.log
    console.log = (...args) => logs.push(args.map(String).join(" "))
    const ctx = collectingCtx()
    try {
      await worker.scheduled(
        {},
        { ...baseEnv, BUNDLES: bucket },
        ctx,
      )
      await ctx.drain()
    } finally {
      console.log = realLog
    }
    const summary = logs.find(l => l.startsWith("anchor cron: 2 pids"))
    assert.ok(summary, `expected summary log; got:\n${logs.join("\n")}`)
  })

  it("calls the anchor webhook for each pid", async () => {
    const { MockR2Bucket } = await import("./mock-r2.js")
    const { R2Archive } = await import("../src/r2-archive.js")
    const bucket = new MockR2Bucket()
    const archive = new R2Archive(bucket)
    await archive.archiveBundle({
      pid: "pid-cron",
      slot: 0,
      zkhash: "sha256:0",
      buf: new Uint8Array(),
    })
    const calls = []
    const realFetch = global.fetch
    global.fetch = async (url, opts) => {
      calls.push({ url: String(url), opts })
      return new Response("", { status: 200 })
    }
    const ctx = collectingCtx()
    try {
      await worker.scheduled(
        {},
        {
          ...baseEnv,
          BUNDLES: bucket,
          ANCHOR_URL: "https://anchor.example/post",
        },
        ctx,
      )
      await ctx.drain()
    } finally {
      global.fetch = realFetch
    }
    assert.equal(calls.length, 1)
    assert.equal(calls[0].url, "https://anchor.example/post")
    const body = JSON.parse(calls[0].opts.body)
    assert.equal(body.pid, "pid-cron")
    assert.equal(body.slot, 0)
  })
})
