// WAL alarm logic tests.
//
// Scope: collectBundle (pure walk), walFlush (orchestration with io + hbClient),
// rescheduleWalAlarm (storage interaction). The DO alarm() callback is tested
// in process-do-alarm.test.js.

import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import doKv from "../src/do-kv.js"
import { MockStorage } from "./mock-storage.js"
import {
  collectBundle,
  walFlush,
  rescheduleWalAlarm,
  WAL_INTERVAL_MS,
} from "../src/wal-do.js"

const signedEntry = (i, payload = {}) => ({
  opt: {
    headers: { signature: `sig-${i}`, "signature-input": "x" },
    body: JSON.stringify({ q: payload }),
  },
  hashpath: `h-${i}`,
  ts: 1_000_000 + i,
})

const unsignedEntry = i => ({
  opt: { headers: {}, body: "" },
  hashpath: `h-${i}`,
  ts: 1_000_000 + i,
})

describe("collectBundle", () => {
  it("returns empty bundle when no WAL entries", async () => {
    const io = await doKv(new MockStorage())
    const { bundle, newHeight } = collectBundle(io, 0)
    assert.equal(bundle.length, 0)
    assert.equal(newHeight, 0)
  })

  it("walks contiguous signed entries", async () => {
    const io = await doKv(new MockStorage())
    io.put(["__wal__", 0], signedEntry(0))
    io.put(["__wal__", 1], signedEntry(1))
    io.put(["__wal__", 2], signedEntry(2))
    const { bundle, newHeight } = collectBundle(io, 0)
    assert.equal(bundle.length, 3)
    assert.equal(newHeight, 3)
    assert.equal(bundle[0].slot, 0)
    assert.equal(bundle[2].slot, 2)
  })

  it("starts at the given height (skips already-flushed)", async () => {
    const io = await doKv(new MockStorage())
    io.put(["__wal__", 0], signedEntry(0))
    io.put(["__wal__", 1], signedEntry(1))
    io.put(["__wal__", 2], signedEntry(2))
    const { bundle, newHeight } = collectBundle(io, 1)
    assert.equal(bundle.length, 2)
    assert.equal(newHeight, 3)
    assert.equal(bundle[0].slot, 1)
  })

  it("stops at the first unsigned entry (matches wal.js#commit)", async () => {
    const io = await doKv(new MockStorage())
    io.put(["__wal__", 0], signedEntry(0))
    io.put(["__wal__", 1], unsignedEntry(1))
    io.put(["__wal__", 2], signedEntry(2))
    const { bundle, newHeight } = collectBundle(io, 0)
    assert.equal(bundle.length, 1)
    assert.equal(newHeight, 1)
  })

  it("preserves opt fields plus slot/ts/hashpath in the bundle", async () => {
    const io = await doKv(new MockStorage())
    const e = signedEntry(5, { foo: "bar" })
    io.put(["__wal__", 5], e)
    const { bundle } = collectBundle(io, 5)
    assert.equal(bundle[0].slot, 5)
    assert.equal(bundle[0].ts, e.ts)
    assert.equal(bundle[0].hashpath, e.hashpath)
    assert.deepEqual(bundle[0].headers, e.opt.headers)
    assert.equal(bundle[0].body, e.opt.body)
  })
})

describe("walFlush", () => {
  let io
  let storage
  let sentBundles
  let fakeHB

  beforeEach(async () => {
    storage = new MockStorage()
    io = await doKv(storage)
    sentBundles = []
    fakeHB = {
      sendBundle: async ({ pid, bundle }) => {
        sentBundles.push({ pid, bundle })
        return { slot: bundle.length, pid }
      },
    }
  })

  it("noop when WAL is empty", async () => {
    const r = await walFlush({ io, hbClient: fakeHB, pid: "p1" })
    assert.equal(r.flushed, 0)
    assert.equal(sentBundles.length, 0)
  })

  it("sends bundle to HB and advances height", async () => {
    io.put(["__wal__", 0], signedEntry(0))
    io.put(["__wal__", 1], signedEntry(1))
    await io.flush()

    const r = await walFlush({ io, hbClient: fakeHB, pid: "p1" })
    assert.equal(r.flushed, 2)
    assert.equal(r.newHeight, 2)
    assert.equal(sentBundles.length, 1)
    assert.equal(sentBundles[0].pid, "p1")
    assert.equal(sentBundles[0].bundle.length, 2)

    // Height was persisted
    assert.equal(await storage.get("__meta__/height"), 2)
  })

  it("starts from the persisted __meta__/height", async () => {
    await storage.put("__meta__/height", 1)
    io.put(["__wal__", 0], signedEntry(0))
    io.put(["__wal__", 1], signedEntry(1))
    io.put(["__wal__", 2], signedEntry(2))
    await io.flush()
    // Re-hydrate so io picks up the meta.
    const io2 = await doKv(storage)
    const r = await walFlush({ io: io2, hbClient: fakeHB, pid: "p1" })
    assert.equal(r.flushed, 2)
    assert.equal(sentBundles[0].bundle[0].slot, 1)
    assert.equal(sentBundles[0].bundle[1].slot, 2)
  })

  it("propagates HB errors and does not advance height", async () => {
    io.put(["__wal__", 0], signedEntry(0))
    await io.flush()
    const failingHB = {
      sendBundle: async () => {
        throw new Error("HB unreachable")
      },
    }
    await assert.rejects(
      () => walFlush({ io, hbClient: failingHB, pid: "p1" }),
      /HB unreachable/,
    )
    // Height not advanced
    assert.equal(io.get("__meta__/height"), null)
  })
})

describe("rescheduleWalAlarm", () => {
  it("sets an alarm when none is pending", async () => {
    let scheduled = null
    const storage = {
      getAlarm: async () => null,
      setAlarm: async ts => {
        scheduled = ts
      },
    }
    const before = Date.now()
    await rescheduleWalAlarm(storage)
    assert.ok(scheduled !== null)
    assert.ok(scheduled >= before + WAL_INTERVAL_MS - 50)
    assert.ok(scheduled <= before + WAL_INTERVAL_MS + 50)
  })

  it("brings an alarm earlier if pending one is later", async () => {
    let scheduled = null
    const farFuture = Date.now() + 60_000
    const storage = {
      getAlarm: async () => farFuture,
      setAlarm: async ts => {
        scheduled = ts
      },
    }
    await rescheduleWalAlarm(storage)
    assert.ok(scheduled !== null)
    assert.ok(scheduled < farFuture)
  })

  it("leaves the alarm alone if a sooner one is already pending", async () => {
    let setCalls = 0
    const storage = {
      getAlarm: async () => Date.now() + 100, // sooner than the interval
      setAlarm: async () => {
        setCalls++
      },
    }
    await rescheduleWalAlarm(storage)
    assert.equal(setCalls, 0)
  })
})
