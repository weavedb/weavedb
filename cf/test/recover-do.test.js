// Recovery tests.
//
// Mirrors the replay logic in hb/src/recover.js: pages of HB scheduler
// assignments → JSON-decoded body data → db.write(entry) for entries above
// the current height.

import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import doKv from "../src/do-kv.js"
import { MockStorage } from "./mock-storage.js"
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
