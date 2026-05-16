// Unit tests for cf/src/anchor.js — the on-chain anchor cron.
//
// Verify pid discovery from R2, head-slot resolution, dry-run mode,
// webhook delivery, idempotency via the persisted anchor state, and
// resilience to errors (one bad pid doesn't sink the others).

import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import {
  listPids,
  readAnchorState,
  writeAnchorState,
  anchorPid,
  anchorAll,
} from "../src/anchor.js"
import { R2Archive } from "../src/r2-archive.js"
import { MockR2Bucket } from "./mock-r2.js"

const PID_A = "pid-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
const PID_B = "pid-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

async function plantBundles(bucket, pid, slots) {
  const archive = new R2Archive(bucket)
  for (const slot of slots) {
    await archive.archiveBundle({
      pid,
      slot,
      zkhash: `sha256:${pid}-${slot}`,
      buf: new Uint8Array([slot]),
      ts: 1_000_000 + slot,
    })
  }
}

describe("anchor: listPids", () => {
  let bucket
  beforeEach(() => {
    bucket = new MockR2Bucket()
  })

  it("returns empty when no bundles exist", async () => {
    assert.deepEqual(await listPids(bucket), [])
  })

  it("discovers a single pid", async () => {
    await plantBundles(bucket, PID_A, [0, 1, 2])
    assert.deepEqual(await listPids(bucket), [PID_A])
  })

  it("dedupes across multiple bundles for the same pid", async () => {
    await plantBundles(bucket, PID_A, [0, 1, 2, 3, 4])
    const pids = await listPids(bucket)
    assert.equal(pids.length, 1)
    assert.equal(pids[0], PID_A)
  })

  it("returns all distinct pids", async () => {
    await plantBundles(bucket, PID_A, [0, 1])
    await plantBundles(bucket, PID_B, [0])
    const pids = (await listPids(bucket)).sort()
    assert.deepEqual(pids, [PID_A, PID_B].sort())
  })

  it("ignores non-bundle keys", async () => {
    await plantBundles(bucket, PID_A, [0])
    await bucket.put("anchors/something.json", new Uint8Array([1]))
    await bucket.put("garbage/key", new Uint8Array([2]))
    assert.deepEqual(await listPids(bucket), [PID_A])
  })
})

describe("anchor: state persistence", () => {
  it("returns null when no state has been written", async () => {
    const bucket = new MockR2Bucket()
    assert.equal(await readAnchorState(bucket, PID_A), null)
  })

  it("round-trips state", async () => {
    const bucket = new MockR2Bucket()
    await writeAnchorState(bucket, PID_A, {
      lastAnchoredSlot: 7,
      lastAnchoredAt: 1234,
    })
    const got = await readAnchorState(bucket, PID_A)
    assert.deepEqual(got, { lastAnchoredSlot: 7, lastAnchoredAt: 1234 })
  })

  it("is per-pid", async () => {
    const bucket = new MockR2Bucket()
    await writeAnchorState(bucket, PID_A, { lastAnchoredSlot: 1, lastAnchoredAt: 1 })
    await writeAnchorState(bucket, PID_B, { lastAnchoredSlot: 99, lastAnchoredAt: 9 })
    const a = await readAnchorState(bucket, PID_A)
    const b = await readAnchorState(bucket, PID_B)
    assert.equal(a.lastAnchoredSlot, 1)
    assert.equal(b.lastAnchoredSlot, 99)
  })
})

describe("anchor: anchorPid", () => {
  let bucket
  beforeEach(() => {
    bucket = new MockR2Bucket()
  })

  it("returns 'no bundles' when pid has no archived slots", async () => {
    const r = await anchorPid({ pid: "pid-empty", bucket })
    assert.equal(r.status, "skipped")
    assert.equal(r.reason, "no bundles")
    assert.equal(r.slot, -1)
  })

  it("dry-run mode when ANCHOR_URL is absent", async () => {
    await plantBundles(bucket, PID_A, [0, 1, 2])
    const r = await anchorPid({ pid: PID_A, bucket })
    assert.equal(r.status, "dry-run")
    assert.equal(r.slot, 2)
    assert.equal(r.zkhash, `sha256:${PID_A}-2`)
  })

  it("POSTs to the webhook with payload", async () => {
    await plantBundles(bucket, PID_A, [0, 1, 2])
    const calls = []
    const fakeFetch = async (url, opts) => {
      calls.push({ url, opts })
      return { ok: true, status: 200, async text() { return "" } }
    }
    const r = await anchorPid({
      pid: PID_A,
      bucket,
      anchorUrl: "https://anchor.example/post",
      fetch: fakeFetch,
    })
    assert.equal(r.status, "anchored")
    assert.equal(r.slot, 2)
    assert.equal(calls.length, 1)
    assert.equal(calls[0].url, "https://anchor.example/post")
    assert.equal(calls[0].opts.method, "POST")
    const body = JSON.parse(calls[0].opts.body)
    assert.equal(body.pid, PID_A)
    assert.equal(body.slot, 2)
    assert.equal(body.zkhash, `sha256:${PID_A}-2`)
    assert.equal(typeof body.ts, "number")
  })

  it("persists anchor state on success", async () => {
    await plantBundles(bucket, PID_A, [0, 1, 2])
    const fakeFetch = async () => ({ ok: true, status: 200, async text() { return "" } })
    await anchorPid({
      pid: PID_A,
      bucket,
      anchorUrl: "https://anchor.example/post",
      fetch: fakeFetch,
    })
    const state = await readAnchorState(bucket, PID_A)
    assert.equal(state.lastAnchoredSlot, 2)
    assert.ok(typeof state.lastAnchoredAt === "number")
  })

  it("idempotent — re-anchoring the same head is a skip", async () => {
    await plantBundles(bucket, PID_A, [0, 1, 2])
    let calls = 0
    const fakeFetch = async () => {
      calls++
      return { ok: true, status: 200, async text() { return "" } }
    }
    await anchorPid({ pid: PID_A, bucket, anchorUrl: "x", fetch: fakeFetch })
    const r2 = await anchorPid({ pid: PID_A, bucket, anchorUrl: "x", fetch: fakeFetch })
    assert.equal(calls, 1, "webhook should be called exactly once")
    assert.equal(r2.status, "skipped")
    assert.equal(r2.reason, "head already anchored")
  })

  it("re-anchors when head advances past last anchored slot", async () => {
    await plantBundles(bucket, PID_A, [0])
    let calls = 0
    const fakeFetch = async () => {
      calls++
      return { ok: true, status: 200, async text() { return "" } }
    }
    await anchorPid({ pid: PID_A, bucket, anchorUrl: "x", fetch: fakeFetch })
    // New bundle lands.
    await plantBundles(bucket, PID_A, [1])
    const r = await anchorPid({ pid: PID_A, bucket, anchorUrl: "x", fetch: fakeFetch })
    assert.equal(calls, 2)
    assert.equal(r.status, "anchored")
    assert.equal(r.slot, 1)
  })

  it("non-2xx response yields status: error", async () => {
    await plantBundles(bucket, PID_A, [0])
    const fakeFetch = async () => ({
      ok: false,
      status: 502,
      async text() { return "Bad Gateway" },
    })
    const r = await anchorPid({
      pid: PID_A,
      bucket,
      anchorUrl: "https://anchor.example/post",
      fetch: fakeFetch,
    })
    assert.equal(r.status, "error")
    assert.match(r.err, /502/)
    // State is NOT advanced when the anchor fails.
    const state = await readAnchorState(bucket, PID_A)
    assert.equal(state, null)
  })

  it("network error yields status: error", async () => {
    await plantBundles(bucket, PID_A, [0])
    const fakeFetch = async () => {
      throw new Error("network down")
    }
    const r = await anchorPid({
      pid: PID_A,
      bucket,
      anchorUrl: "https://x",
      fetch: fakeFetch,
    })
    assert.equal(r.status, "error")
    assert.match(r.err, /network down/)
  })
})

describe("anchor: anchorAll", () => {
  it("returns empty when no pids", async () => {
    const r = await anchorAll({ bucket: new MockR2Bucket() })
    assert.deepEqual(r, [])
  })

  it("anchors each pid in dry-run mode by default", async () => {
    const bucket = new MockR2Bucket()
    await plantBundles(bucket, PID_A, [0, 1])
    await plantBundles(bucket, PID_B, [0])
    const r = await anchorAll({ bucket })
    assert.equal(r.length, 2)
    assert.ok(r.every(x => x.status === "dry-run"))
  })

  it("one pid's error does not stop the others", async () => {
    const bucket = new MockR2Bucket()
    await plantBundles(bucket, PID_A, [0])
    await plantBundles(bucket, PID_B, [0])
    let calls = 0
    const fakeFetch = async () => {
      calls++
      // First call (whichever pid it is) fails; subsequent succeeds.
      if (calls === 1) throw new Error("first request failed")
      return { ok: true, status: 200, async text() { return "" } }
    }
    const r = await anchorAll({
      bucket,
      anchorUrl: "https://x",
      fetch: fakeFetch,
    })
    assert.equal(r.length, 2)
    const errors = r.filter(x => x.status === "error").length
    const anchored = r.filter(x => x.status === "anchored").length
    assert.equal(errors, 1)
    assert.equal(anchored, 1)
  })
})
