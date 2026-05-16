// Recovery tests.
//
// Mirrors the replay logic in hb/src/recover.js: pages of HB scheduler
// assignments → JSON-decoded body data → db.write(entry) for entries above
// the current height.

import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import doKv from "../src/do-kv.js"
import { MockStorage } from "./mock-storage.js"
import { MockR2Bucket } from "./mock-r2.js"
import { R2Archive } from "../src/r2-archive.js"
import { serializeBundle, META_LAST_ARCHIVED_SLOT } from "../src/wal-do.js"
import { recover } from "../src/recover-do.js"

/** Build a paged getMsgs response mimicking HB's shape. */
function makePages(...pages) {
  let i = 0
  return async () => {
    if (i >= pages.length) return { assignments: {} }
    return pages[i++]
  }
}

function asPage(entries, slot = 0) {
  return {
    assignments: {
      [String(slot)]: {
        slot,
        body: { data: JSON.stringify(entries) },
      },
    },
  }
}

describe("recover", () => {
  let storage
  let io
  let writeCalls

  beforeEach(async () => {
    storage = new MockStorage()
    io = await doKv(storage)
    writeCalls = []
  })

  const fakeDb = () => ({
    write: async v => {
      writeCalls.push(v)
      return { success: true }
    },
  })

  it("returns immediately when HB has no assignments", async () => {
    const hbClient = { getMsgs: async () => ({ assignments: {} }) }
    const r = await recover({ io, hbClient, pid: "p1", db: fakeDb() })
    assert.equal(r.replayed, 0)
    assert.equal(r.height, 0)
    assert.equal(writeCalls.length, 0)
  })

  it("returns gracefully when HB throws (network error)", async () => {
    const hbClient = {
      getMsgs: async () => {
        throw new Error("ECONNREFUSED")
      },
    }
    const r = await recover({ io, hbClient, pid: "p1", db: fakeDb() })
    assert.equal(r.replayed, 0)
    assert.match(r.error, /ECONNREFUSED/)
    assert.equal(writeCalls.length, 0)
  })

  it("replays a single page and advances height", async () => {
    const entries = [{ slot: 1 }, { slot: 2 }, { slot: 3 }]
    const hbClient = { getMsgs: makePages(asPage(entries)) }
    const db = fakeDb()
    const r = await recover({ io, hbClient, pid: "p1", db })
    assert.equal(writeCalls.length, 3)
    assert.deepEqual(writeCalls, entries)
    assert.equal(r.replayed, 3)
    // Height tracks i (the global counter of seen entries).
    assert.equal(r.height, 2)
  })

  it("skips entries below the persisted height", async () => {
    await storage.put("__meta__/height", 2)
    const io2 = await doKv(storage)
    const entries = [{ slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }]
    const hbClient = { getMsgs: makePages(asPage(entries)) }
    const db = fakeDb()
    await recover({ io: io2, hbClient, pid: "p1", db })
    assert.equal(writeCalls.length, 2)
    assert.deepEqual(writeCalls, [{ slot: 2 }, { slot: 3 }])
  })

  it("walks across multiple pages until empty", async () => {
    const hbClient = {
      getMsgs: makePages(
        asPage([{ slot: 1 }, { slot: 2 }]),
        asPage([{ slot: 3 }, { slot: 4 }]),
        // third call → empty
      ),
    }
    const db = fakeDb()
    await recover({ io, hbClient, pid: "p1", db })
    assert.equal(writeCalls.length, 4)
  })

  it("persists __meta__/height after replay", async () => {
    const hbClient = { getMsgs: makePages(asPage([{ slot: 1 }, { slot: 2 }])) }
    await recover({ io, hbClient, pid: "p1", db: fakeDb() })
    assert.equal(await storage.get("__meta__/height"), 2)
  })

  it("continues past a single bad message (logs and moves on)", async () => {
    let n = 0
    const db = {
      write: async v => {
        n++
        if (n === 2) throw new Error("schema invalid")
        return { success: true }
      },
    }
    const hbClient = {
      getMsgs: makePages(
        asPage([{ slot: 1 }, { slot: 2 }, { slot: 3 }]),
      ),
    }
    const r = await recover({ io, hbClient, pid: "p1", db })
    assert.equal(n, 3, "all three writes were attempted despite middle failure")
    assert.equal(r.replayed, 3)
  })
})

describe("recover from R2", () => {
  let storage
  let io
  let bucket
  let archive
  let writeCalls

  beforeEach(async () => {
    storage = new MockStorage()
    io = await doKv(storage)
    bucket = new MockR2Bucket()
    archive = new R2Archive(bucket)
    writeCalls = []
  })

  const fakeDb = () => ({
    write: async v => {
      writeCalls.push(v)
      return { success: true }
    },
  })

  function entry(slot, payload = {}) {
    return {
      path: null,
      headers: { signature: `sig-${slot}` },
      body: JSON.stringify({ q: payload }),
      hashpath: `hp-${slot}`,
      slot,
      ts: 1_000_000 + slot,
    }
  }

  async function plantBundle(headSlot, entries) {
    const buf = serializeBundle(entries)
    await archive.archiveBundle({
      pid: "p1",
      slot: headSlot,
      zkhash: `sha256:b${headSlot}`,
      buf,
      ts: 1_000_000 + headSlot,
    })
  }

  it("noop when no R2 bundles and no HB", async () => {
    const r = await recover({ io, r2Archive: archive, pid: "p1", db: fakeDb() })
    assert.equal(r.replayed, 0)
    assert.equal(writeCalls.length, 0)
  })

  it("replays entries from a single archived bundle", async () => {
    await plantBundle(2, [entry(0), entry(1), entry(2)])
    const r = await recover({ io, r2Archive: archive, pid: "p1", db: fakeDb() })
    assert.equal(r.replayed, 3)
    assert.equal(writeCalls.length, 3)
    // Each replayed entry hits db.write with a request-shaped object.
    for (let i = 0; i < 3; i++) {
      assert.ok(writeCalls[i].headers)
      assert.equal(writeCalls[i].headers.signature, `sig-${i}`)
    }
    // Storage tracks next-to-consider slot.
    assert.equal(await storage.get("__meta__/height"), 3)
    assert.equal(await storage.get(META_LAST_ARCHIVED_SLOT), 2)
  })

  it("replays entries across multiple bundles in slot order", async () => {
    await plantBundle(2, [entry(0), entry(1), entry(2)])
    await plantBundle(5, [entry(3), entry(4), entry(5)])
    await plantBundle(7, [entry(6), entry(7)])
    const r = await recover({ io, r2Archive: archive, pid: "p1", db: fakeDb() })
    assert.equal(r.replayed, 8)
    assert.equal(writeCalls.length, 8)
    // Entries are written in slot order regardless of bundle layout.
    for (let i = 0; i < 8; i++) {
      assert.equal(writeCalls[i].headers.signature, `sig-${i}`)
    }
    assert.equal(await storage.get(META_LAST_ARCHIVED_SLOT), 7)
  })

  it("skips entries below the persisted height", async () => {
    // Pretend slots 0..2 were already applied (e.g. via HB recovery,
    // or a previous run that crashed mid-flight).
    await storage.put("__meta__/height", 3)
    const io2 = await doKv(storage)
    await plantBundle(4, [entry(0), entry(1), entry(2), entry(3), entry(4)])
    const r = await recover({
      io: io2,
      r2Archive: archive,
      pid: "p1",
      db: fakeDb(),
    })
    assert.equal(r.replayed, 2)
    assert.deepEqual(
      writeCalls.map(w => w.headers.signature),
      ["sig-3", "sig-4"],
    )
    assert.equal(await storage.get("__meta__/height"), 5)
  })

  it("survives a corrupt bundle and continues", async () => {
    await plantBundle(1, [entry(0), entry(1)])
    // Plant garbage at slot 3.
    await archive.archiveBundle({
      pid: "p1",
      slot: 3,
      zkhash: "sha256:garbage",
      buf: new Uint8Array([0xff, 0xee, 0xdd]),
      ts: 99,
    })
    await plantBundle(5, [entry(4), entry(5)])
    const r = await recover({ io, r2Archive: archive, pid: "p1", db: fakeDb() })
    // 4 entries from the two good bundles, garbage bundle skipped.
    assert.equal(r.replayed, 4)
    assert.deepEqual(
      writeCalls.map(w => w.headers.signature),
      ["sig-0", "sig-1", "sig-4", "sig-5"],
    )
  })

  it("returns error when R2 listBundles throws", async () => {
    const failing = {
      listBundles: async () => {
        throw new Error("R2 down")
      },
      readBundle: async () => null,
    }
    const r = await recover({
      io,
      r2Archive: failing,
      pid: "p1",
      db: fakeDb(),
    })
    assert.equal(r.replayed, 0)
    assert.match(r.error, /R2 down/)
  })
})

describe("recover from HB + R2 (combined)", () => {
  let storage
  let io
  let bucket
  let archive
  let writeCalls

  beforeEach(async () => {
    storage = new MockStorage()
    io = await doKv(storage)
    bucket = new MockR2Bucket()
    archive = new R2Archive(bucket)
    writeCalls = []
  })

  const fakeDb = () => ({
    write: async v => {
      writeCalls.push(v)
      return { success: true }
    },
  })

  function entry(slot, payload = {}) {
    return {
      path: null,
      headers: { signature: `sig-${slot}` },
      body: JSON.stringify({ q: payload }),
      hashpath: `hp-${slot}`,
      slot,
      ts: 1_000_000 + slot,
    }
  }

  function asPage(entries, slot = 0) {
    return {
      assignments: {
        [String(slot)]: { slot, body: { data: JSON.stringify(entries) } },
      },
    }
  }

  it("HB recovers slots 0..2, R2 continues from slot 3", async () => {
    // HB has 3 entries.
    let hbCall = 0
    const hbClient = {
      getMsgs: async () => {
        if (hbCall++ === 0) {
          return asPage([{ slot: 0 }, { slot: 1 }, { slot: 2 }])
        }
        return { assignments: {} }
      },
    }
    // R2 has all 6, but only 3..5 will be applied (HB already covered 0..2).
    const all = [0, 1, 2, 3, 4, 5].map(slot => entry(slot))
    await archive.archiveBundle({
      pid: "p1",
      slot: 5,
      zkhash: "sha256:b5",
      buf: serializeBundle(all),
      ts: 5,
    })

    await recover({
      io,
      hbClient,
      r2Archive: archive,
      pid: "p1",
      db: fakeDb(),
    })
    // 3 HB writes + 3 R2 writes = 6 total. HB entries are plain
    // {slot: N} objects (test fixture). R2 entries are
    // request-shaped {headers, body} via deserializeBundle.
    assert.equal(writeCalls.length, 6)
    // First 3 came from HB (plain shape).
    for (let i = 0; i < 3; i++) {
      assert.deepEqual(writeCalls[i], { slot: i })
    }
    // Next 3 from R2 (request shape).
    for (let i = 0; i < 3; i++) {
      assert.equal(writeCalls[3 + i].headers.signature, `sig-${i + 3}`)
    }
    assert.equal(await storage.get("__meta__/height"), 6)
  })
})
