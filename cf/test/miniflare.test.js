// Miniflare-driven integration tests.
//
// Boots the actual bundled Worker + DO inside the Cloudflare workerd runtime
// (via wrangler's unstable_dev). Exercises HTTP endpoints over real fetch.
// This is the test that catches Workers-compat issues in our code or in
// any of core/'s transitive dependencies that surface only at runtime
// (Buffer-vs-Uint8Array edges, missing globals, lmdb stowaways, etc.).
//
// Distinction from the other tests in this directory:
//   - do-kv.test.js, wal-do.test.js, recover-do.test.js, mock-state.test.js
//     run pure JS in node:test against in-memory mocks. Fast and dep-free.
//   - This file boots the Cloudflare runtime. Slower (~few seconds startup),
//     requires `wrangler` from devDeps, and validates real-runtime behavior.
//
// Run: cd cf && npm run test:integration

import { describe, it, before, after } from "node:test"
import assert from "node:assert/strict"
import { unstable_dev } from "wrangler"

let worker

before(async () => {
  worker = await unstable_dev("src/worker.js", {
    config: "wrangler.toml",
    experimental: { disableExperimentalWarning: true },
    // The wrangler.toml HB_URL points at production hb.wdb.ae; override
    // for tests so recovery doesn't try to reach the public endpoint.
    vars: {
      HB_URL: "http://127.0.0.1:9", // unreachable; recovery will fail-safe
      ADMIN_ONLY: "false",
    },
  })
})

after(async () => {
  if (worker) await worker.stop()
})

async function readJson(res) {
  const t = await res.text()
  try {
    return JSON.parse(t)
  } catch {
    throw new Error(`expected JSON, got: ${t.slice(0, 200)}`)
  }
}

describe("Miniflare: Worker boots", () => {
  it("/status returns node info", async () => {
    const res = await worker.fetch("/status")
    assert.equal(res.status, 200)
    const j = await readJson(res)
    assert.equal(j.name, "WeaveDB")
    assert.equal(j["wal-type"], "HyperBEAM")
    assert.equal(j.status, "ok")
  })

  it("unknown route returns 404", async () => {
    const res = await worker.fetch("/no-such-route")
    assert.equal(res.status, 404)
  })

  it("/~weavedb@1.0/get without id header returns 400", async () => {
    const res = await worker.fetch(
      "/~weavedb@1.0/get?query=" + encodeURIComponent('["get","posts"]'),
    )
    assert.equal(res.status, 400)
    const j = await readJson(res)
    assert.match(j.err, /missing id header/)
  })

  it("/~weavedb@1.0/set without id header returns 400", async () => {
    const res = await worker.fetch("/~weavedb@1.0/set", {
      method: "POST",
      body: "",
    })
    assert.equal(res.status, 400)
    const j = await readJson(res)
    assert.match(j.err, /missing id header/)
  })
})

describe("Miniflare: per-pid DO routing", () => {
  it("/~weavedb@1.0/get on a fresh pid returns 'db not initialized'", async () => {
    const res = await worker.fetch(
      "/~weavedb@1.0/get?query=" + encodeURIComponent('["get","posts"]'),
      {
        headers: { id: "test-pid-fresh-1" },
      },
    )
    assert.equal(res.status, 400)
    const j = await readJson(res)
    assert.match(j.err, /not initialized/)
  })

  it("/~weavedb@1.0/set with garbage body returns 401 (invalid signature)", async () => {
    const res = await worker.fetch("/~weavedb@1.0/set", {
      method: "POST",
      headers: { id: "test-pid-fresh-2" },
      body: "not-a-real-signed-request",
    })
    assert.equal(res.status, 401)
    const j = await readJson(res)
    assert.match(j.err, /invalid signature/)
  })
})
