// Unit tests for cf/src/r2-archive.js.
//
// These verify the R2Archive wrapper's contract against an in-memory
// MockR2Bucket: key layout, custom-metadata round-trip, list ordering,
// from/to windowing, headSlot, and absent-key behavior. Passing this
// suite is a necessary (not sufficient) condition for plugging
// R2Archive into the DO alarm in PR 2.
//
// Miniflare-against-real-R2 coverage will be added in
// cf/test/miniflare.test.js once the alarm wires this up.
//
// Run: cd cf && npm test

import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { R2Archive, bundleKey, parseBundleKey } from "../src/r2-archive.js"
import { MockR2Bucket } from "./mock-r2.js"

const PID = "pid-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
const PID2 = "pid-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

describe("bundleKey", () => {
  it("zero-pads slot to 12 digits", () => {
    assert.equal(bundleKey(PID, 0), `bundles/${PID}/000000000000.bin`)
    assert.equal(bundleKey(PID, 42), `bundles/${PID}/000000000042.bin`)
  })

  it("preserves lexicographic == numeric ordering for slots < 1e12", () => {
    const k1 = bundleKey(PID, 1)
    const k2 = bundleKey(PID, 10)
    const k99 = bundleKey(PID, 99)
    assert.ok(k1 < k2, `${k1} < ${k2}`)
    assert.ok(k2 < k99, `${k2} < ${k99}`)
  })

  it("rejects non-string pid", () => {
    assert.throws(() => bundleKey(null, 0), /pid must be/)
    assert.throws(() => bundleKey(42, 0), /pid must be/)
  })

  it("rejects negative or non-integer slot", () => {
    assert.throws(() => bundleKey(PID, -1), /non-negative integer/)
    assert.throws(() => bundleKey(PID, 1.5), /non-negative integer/)
    assert.throws(() => bundleKey(PID, "0"), /non-negative integer/)
  })
})

describe("parseBundleKey", () => {
  it("round-trips a (pid, slot) pair", () => {
    const k = bundleKey(PID, 7)
    assert.deepEqual(parseBundleKey(k), { pid: PID, slot: 7 })
  })

  it("returns null on shape mismatch", () => {
    assert.equal(parseBundleKey("not-a-bundle-key"), null)
    assert.equal(parseBundleKey("bundles/foo/1.bin"), null) // unpadded
    assert.equal(parseBundleKey(`bundles/${PID}/000000000000.txt`), null)
  })
})

describe("R2Archive: archive + read round-trip", () => {
  /** @type {MockR2Bucket} */
  let bucket
  /** @type {R2Archive} */
  let archive

  beforeEach(() => {
    bucket = new MockR2Bucket()
    archive = new R2Archive(bucket)
  })

  it("requires a bucket", () => {
    assert.throws(() => new R2Archive(undefined), /bucket binding/)
    assert.throws(() => new R2Archive(null), /bucket binding/)
  })

  it("writes a bundle to the canonical key", async () => {
    const buf = new Uint8Array([1, 2, 3, 4])
    const { key } = await archive.archiveBundle({
      pid: PID,
      slot: 5,
      zkhash: "0xdeadbeef",
      buf,
      ts: 1700000000000,
    })
    assert.equal(key, bundleKey(PID, 5))
    assert.ok(bucket.data.has(key), `bucket should contain ${key}`)
  })

  it("readBundle returns null for an absent slot", async () => {
    const got = await archive.readBundle({ pid: PID, slot: 0 })
    assert.equal(got, null)
  })

  it("readBundle round-trips zkhash, buf, ts", async () => {
    const buf = new Uint8Array([9, 8, 7, 6, 5])
    const ts = 1700000000123
    await archive.archiveBundle({
      pid: PID,
      slot: 3,
      zkhash: "0xabc",
      buf,
      ts,
    })
    const got = await archive.readBundle({ pid: PID, slot: 3 })
    assert.equal(got.zkhash, "0xabc")
    assert.equal(got.ts, ts)
    assert.deepEqual(Array.from(got.buf), Array.from(buf))
  })

  it("re-archiving the same slot overwrites in place", async () => {
    await archive.archiveBundle({
      pid: PID,
      slot: 1,
      zkhash: "first",
      buf: new Uint8Array([1]),
    })
    await archive.archiveBundle({
      pid: PID,
      slot: 1,
      zkhash: "second",
      buf: new Uint8Array([2, 2]),
    })
    const got = await archive.readBundle({ pid: PID, slot: 1 })
    assert.equal(got.zkhash, "second")
    assert.deepEqual(Array.from(got.buf), [2, 2])
  })

  it("rejects invalid zkhash", async () => {
    await assert.rejects(
      archive.archiveBundle({
        pid: PID,
        slot: 0,
        zkhash: "",
        buf: new Uint8Array(),
      }),
      /zkhash must be/,
    )
    await assert.rejects(
      archive.archiveBundle({
        pid: PID,
        slot: 0,
        zkhash: 42,
        buf: new Uint8Array(),
      }),
      /zkhash must be/,
    )
  })

  it("rejects non-Uint8Array buf", async () => {
    await assert.rejects(
      archive.archiveBundle({
        pid: PID,
        slot: 0,
        zkhash: "ok",
        buf: "not bytes",
      }),
      /buf must be a Uint8Array/,
    )
  })

  it("defaults ts to Date.now() when omitted", async () => {
    const t0 = Date.now()
    await archive.archiveBundle({
      pid: PID,
      slot: 9,
      zkhash: "x",
      buf: new Uint8Array(),
    })
    const got = await archive.readBundle({ pid: PID, slot: 9 })
    assert.ok(got.ts >= t0, `ts ${got.ts} should be >= ${t0}`)
    assert.ok(got.ts <= Date.now() + 1000, "ts should be roughly now")
  })
})

describe("R2Archive: listBundles", () => {
  /** @type {MockR2Bucket} */
  let bucket
  /** @type {R2Archive} */
  let archive

  beforeEach(async () => {
    bucket = new MockR2Bucket()
    archive = new R2Archive(bucket)
    // Plant 5 bundles for PID at slots 0..4 and 3 for PID2 at 10..12.
    for (const slot of [0, 1, 2, 3, 4]) {
      await archive.archiveBundle({
        pid: PID,
        slot,
        zkhash: `hash-${slot}`,
        buf: new Uint8Array([slot]),
        ts: 1000 + slot,
      })
    }
    for (const slot of [10, 11, 12]) {
      await archive.archiveBundle({
        pid: PID2,
        slot,
        zkhash: `other-${slot}`,
        buf: new Uint8Array([slot]),
        ts: 2000 + slot,
      })
    }
  })

  it("requires pid", async () => {
    await assert.rejects(archive.listBundles({}), /pid is required/)
  })

  it("returns only entries for the requested pid", async () => {
    const out = await archive.listBundles({ pid: PID })
    assert.equal(out.length, 5)
    for (const e of out) {
      assert.ok(e.key.startsWith(`bundles/${PID}/`))
    }
  })

  it("returns entries sorted ascending by slot", async () => {
    const out = await archive.listBundles({ pid: PID })
    assert.deepEqual(out.map(e => e.slot), [0, 1, 2, 3, 4])
  })

  it("returns metadata (zkhash, ts, size) without body bytes", async () => {
    const out = await archive.listBundles({ pid: PID })
    const e0 = out[0]
    assert.equal(e0.zkhash, "hash-0")
    assert.equal(e0.ts, 1000)
    assert.equal(e0.size, 1)
    assert.equal(e0.slot, 0)
    assert.ok("body" in e0 === false, "list result should not carry body")
  })

  it("filters by from (inclusive)", async () => {
    const out = await archive.listBundles({ pid: PID, from: 2 })
    assert.deepEqual(out.map(e => e.slot), [2, 3, 4])
  })

  it("filters by to (inclusive)", async () => {
    const out = await archive.listBundles({ pid: PID, to: 2 })
    assert.deepEqual(out.map(e => e.slot), [0, 1, 2])
  })

  it("filters by both from and to", async () => {
    const out = await archive.listBundles({ pid: PID, from: 1, to: 3 })
    assert.deepEqual(out.map(e => e.slot), [1, 2, 3])
  })

  it("honors limit", async () => {
    const out = await archive.listBundles({ pid: PID, limit: 2 })
    assert.deepEqual(out.map(e => e.slot), [0, 1])
  })

  it("empty pid returns empty", async () => {
    const out = await archive.listBundles({ pid: "pid-nothing-here-ever" })
    assert.deepEqual(out, [])
  })
})

describe("R2Archive: headSlot", () => {
  it("returns -1 when no bundles exist", async () => {
    const archive = new R2Archive(new MockR2Bucket())
    assert.equal(await archive.headSlot({ pid: PID }), -1)
  })

  it("returns the highest archived slot", async () => {
    const archive = new R2Archive(new MockR2Bucket())
    for (const slot of [0, 7, 3, 12, 5]) {
      await archive.archiveBundle({
        pid: PID,
        slot,
        zkhash: `h${slot}`,
        buf: new Uint8Array(),
      })
    }
    assert.equal(await archive.headSlot({ pid: PID }), 12)
  })

  it("is per-pid", async () => {
    const archive = new R2Archive(new MockR2Bucket())
    await archive.archiveBundle({
      pid: PID,
      slot: 5,
      zkhash: "a",
      buf: new Uint8Array(),
    })
    await archive.archiveBundle({
      pid: PID2,
      slot: 100,
      zkhash: "b",
      buf: new Uint8Array(),
    })
    assert.equal(await archive.headSlot({ pid: PID }), 5)
    assert.equal(await archive.headSlot({ pid: PID2 }), 100)
  })
})
