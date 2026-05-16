// Unit tests for cf/src/hb-scheduler-compat.js — the HB getMsgs
// compatibility layer that lets hb/src/validate.js subscribe to a CF
// rollup as if it were a HyperBEAM scheduler.

import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { getMsgsFromR2, handleScheduleRequest } from "../src/hb-scheduler-compat.js"
import { R2Archive } from "../src/r2-archive.js"
import { serializeBundle } from "../src/wal-do.js"
import { MockR2Bucket } from "./mock-r2.js"

const PID = "pid-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

function entry(slot, payload = {}) {
  return {
    path: null,
    headers: { signature: `sig-${slot}`, "signature-input": "x" },
    body: JSON.stringify({ q: payload }),
    hashpath: `hp-${slot}`,
    slot,
    ts: 1_000_000 + slot,
  }
}

async function plantBundle(archive, pid, headSlot, entries) {
  const buf = serializeBundle(entries)
  await archive.archiveBundle({
    pid,
    slot: headSlot,
    zkhash: `sha256:bundle-${headSlot}`,
    buf,
    ts: 1_000_000 + headSlot,
  })
}

describe("getMsgsFromR2: shape", () => {
  let bucket
  let archive
  beforeEach(() => {
    bucket = new MockR2Bucket()
    archive = new R2Archive(bucket)
  })

  it("rejects missing bucket", async () => {
    await assert.rejects(getMsgsFromR2({ pid: PID }), /bucket required/)
  })

  it("rejects missing pid", async () => {
    await assert.rejects(getMsgsFromR2({ bucket }), /pid required/)
  })

  it("returns empty assignments when nothing is archived", async () => {
    const out = await getMsgsFromR2({ bucket, pid: PID })
    assert.deepEqual(out, { assignments: {} })
  })

  it("returns assignments keyed by entry slot, not bundle head", async () => {
    // Bundle archived at head slot 2 contains entries from slots 0,1,2.
    await plantBundle(archive, PID, 2, [entry(0), entry(1), entry(2)])

    const out = await getMsgsFromR2({ bucket, pid: PID })
    const keys = Object.keys(out.assignments).sort()
    assert.deepEqual(keys, ["0", "1", "2"])
    for (const k of keys) {
      assert.equal(out.assignments[k].slot, Number(k))
    }
  })

  it("each body.data is JSON-encoded list of entries", async () => {
    await plantBundle(archive, PID, 0, [entry(0, { x: 1 })])
    const out = await getMsgsFromR2({ bucket, pid: PID })
    const data = JSON.parse(out.assignments["0"].body.data)
    assert.ok(Array.isArray(data))
    assert.equal(data.length, 1)
    assert.equal(data[0].slot, 0)
    assert.equal(data[0].hashpath, "hp-0")
    assert.deepEqual(JSON.parse(data[0].body), { q: { x: 1 } })
  })
})

describe("getMsgsFromR2: windowing", () => {
  let bucket
  let archive
  beforeEach(async () => {
    bucket = new MockR2Bucket()
    archive = new R2Archive(bucket)
    // 3 bundles. Bundle@2 has entries 0-2; Bundle@5 has entries 3-5; Bundle@7 has 6-7.
    await plantBundle(archive, PID, 2, [entry(0), entry(1), entry(2)])
    await plantBundle(archive, PID, 5, [entry(3), entry(4), entry(5)])
    await plantBundle(archive, PID, 7, [entry(6), entry(7)])
  })

  it("default window returns all 8 entries", async () => {
    const out = await getMsgsFromR2({ bucket, pid: PID })
    assert.equal(Object.keys(out.assignments).length, 8)
  })

  it("from filters out earlier slots", async () => {
    const out = await getMsgsFromR2({ bucket, pid: PID, from: 4 })
    assert.deepEqual(
      Object.keys(out.assignments).map(Number).sort((a, b) => a - b),
      [4, 5, 6, 7],
    )
  })

  it("to filters out later slots", async () => {
    const out = await getMsgsFromR2({ bucket, pid: PID, to: 4 })
    assert.deepEqual(
      Object.keys(out.assignments).map(Number).sort((a, b) => a - b),
      [0, 1, 2, 3, 4],
    )
  })

  it("from + to bracket the range", async () => {
    const out = await getMsgsFromR2({ bucket, pid: PID, from: 2, to: 5 })
    assert.deepEqual(
      Object.keys(out.assignments).map(Number).sort((a, b) => a - b),
      [2, 3, 4, 5],
    )
  })

  it("limit caps entry count, not bundle count", async () => {
    const out = await getMsgsFromR2({ bucket, pid: PID, limit: 4 })
    assert.equal(Object.keys(out.assignments).length, 4)
  })

  it("ignores other pids", async () => {
    // Plant in a different pid; query for PID should not see it.
    const PID2 = "pid-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    await plantBundle(archive, PID2, 0, [entry(0, { other: true })])
    const out = await getMsgsFromR2({ bucket, pid: PID })
    assert.equal(Object.keys(out.assignments).length, 8) // unchanged
  })
})

describe("handleScheduleRequest", () => {
  let bucket
  let archive
  beforeEach(async () => {
    bucket = new MockR2Bucket()
    archive = new R2Archive(bucket)
    await plantBundle(archive, PID, 1, [entry(0), entry(1)])
  })

  it("returns 503 when BUNDLES is not bound", async () => {
    const res = await handleScheduleRequest(
      new Request(
        `http://w/~scheduler@1.0/schedule?target=${PID}&from=0&to=10`,
      ),
      {},
    )
    assert.equal(res.status, 503)
    const j = await res.json()
    assert.match(j.err, /R2 archive not configured/)
  })

  it("returns 400 when target is missing", async () => {
    const res = await handleScheduleRequest(
      new Request(`http://w/~scheduler@1.0/schedule`),
      { BUNDLES: bucket },
    )
    assert.equal(res.status, 400)
    const j = await res.json()
    assert.match(j.err, /missing target/)
  })

  it("returns 200 + HB-shaped assignments on a valid request", async () => {
    const res = await handleScheduleRequest(
      new Request(
        `http://w/~scheduler@1.0/schedule?target=${PID}&from=0&to=10`,
      ),
      { BUNDLES: bucket },
    )
    assert.equal(res.status, 200)
    const j = await res.json()
    assert.ok(j.assignments)
    assert.equal(Object.keys(j.assignments).length, 2)
    // Each assignment matches the validator's expected shape: it has a
    // .slot field and .body.data is a JSON-encoded entry list.
    for (const k of ["0", "1"]) {
      const m = j.assignments[k]
      assert.equal(typeof m.slot, "number")
      assert.ok(m.body && typeof m.body.data === "string")
      const data = JSON.parse(m.body.data)
      assert.ok(Array.isArray(data))
      assert.equal(data[0].slot, Number(k))
    }
  })

  it("respects from/to from query string", async () => {
    const res = await handleScheduleRequest(
      new Request(
        `http://w/~scheduler@1.0/schedule?target=${PID}&from=1&to=1`,
      ),
      { BUNDLES: bucket },
    )
    const j = await res.json()
    assert.deepEqual(Object.keys(j.assignments), ["1"])
  })
})

describe("end-to-end: HBClient.getMsgs shape parity", () => {
  it("matches the validator's expected getMsgs response", async () => {
    // The validator's onslot does:
    //   for (const v of JSON.parse(m.body.data)) {
    //     await this.io.put(`__wmsg__/${v.slot}`, v)
    //   }
    // and validate.js Sync.get reads assignments[k].slot, .body.data.
    // This test asserts each piece exists in the shape it expects.
    const bucket = new MockR2Bucket()
    const archive = new R2Archive(bucket)
    await plantBundle(archive, PID, 2, [
      entry(0, { foo: "bar" }),
      entry(1, { baz: 42 }),
      entry(2, { qux: [1, 2] }),
    ])
    const out = await getMsgsFromR2({ bucket, pid: PID })
    for (const slot of [0, 1, 2]) {
      const m = out.assignments[String(slot)]
      assert.ok(m, `missing assignment for slot ${slot}`)
      assert.equal(typeof m.slot, "number")
      assert.equal(m.slot, slot)
      const entries = JSON.parse(m.body.data)
      assert.ok(Array.isArray(entries))
      for (const v of entries) {
        // Validator expects each v to have .slot, .opt.headers, etc.
        // serializeBundle stores headers directly; validator's onslot
        // path lives in validate.js (see Validator constructor's
        // onslot). The shape match is good enough for the validator's
        // io.put(`__wmsg__/${v.slot}`, v) call to work.
        assert.equal(typeof v.slot, "number")
        assert.ok(v.headers)
        assert.ok(typeof v.hashpath === "string")
      }
    }
  })
})
