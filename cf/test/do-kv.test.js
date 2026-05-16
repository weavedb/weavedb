// Unit tests for the DOIo adapter.
//
// These exercise the adapter's contract — the same contract weavekv.js
// expects from LMDB (sync get/put/remove + async transaction). Passing
// these is a necessary (not sufficient) condition for plugging DOIo
// into core/ in PR 2.
//
// Run: cd cf && npm test
//
// No Miniflare / wrangler dependency — pure node:test against MockStorage.

import { describe, it, before, beforeEach } from "node:test"
import assert from "node:assert/strict"
import doKv, { DOIo } from "../src/do-kv.js"
import { packKey } from "../src/pack-key.js"
import { MockStorage } from "./mock-storage.js"

describe("packKey", () => {
  it("passes string keys through", () => {
    assert.equal(packKey("foo"), "foo")
    assert.equal(packKey("__meta__/current"), "__meta__/current")
  })

  it("joins array keys with /", () => {
    assert.equal(packKey(["__wal__", 5]), "__wal__/5")
    assert.equal(packKey(["a", "b", "c"]), "a/b/c")
  })

  it("stringifies numeric parts", () => {
    assert.equal(packKey(["__wal__", 0]), "__wal__/0")
    assert.equal(packKey(["k", 42]), "k/42")
  })

  it("coerces non-string non-array via String()", () => {
    assert.equal(packKey(123), "123")
  })
})

describe("DOIo: hydration", () => {
  it("hydrate() is a no-op on empty storage", async () => {
    const io = new DOIo(new MockStorage())
    await io.hydrate()
    assert.equal(io.cache.size, 0)
    assert.equal(io.hydrated, true)
  })

  it("hydrate() pulls every key from storage into cache", async () => {
    const s = new MockStorage()
    await s.put({ a: 1, b: 2, "__meta__/current": { i: 5 } })
    const io = new DOIo(s)
    await io.hydrate()
    assert.equal(io.cache.size, 3)
    assert.equal(io.get("a"), 1)
    assert.equal(io.get("b"), 2)
    assert.deepEqual(io.get("__meta__/current"), { i: 5 })
  })

  it("hydrate() is idempotent", async () => {
    const s = new MockStorage()
    await s.put("k", "v")
    const io = new DOIo(s)
    await io.hydrate()
    await io.hydrate()
    assert.equal(io.cache.size, 1)
  })
})

describe("DOIo: sync read/write semantics", () => {
  let io
  let storage

  beforeEach(async () => {
    storage = new MockStorage()
    io = await doKv(storage)
  })

  it("get() returns null for absent keys", () => {
    assert.equal(io.get("missing"), null)
  })

  it("put() then get() returns the value synchronously", () => {
    io.put("k", "v")
    assert.equal(io.get("k"), "v")
  })

  it("put() last-write-wins", () => {
    io.put("k", "v1")
    io.put("k", "v2")
    assert.equal(io.get("k"), "v2")
  })

  it("remove() then get() returns null", () => {
    io.put("k", "v")
    io.remove("k")
    assert.equal(io.get("k"), null)
  })

  it("remove() of unknown key is a no-op (returns null)", () => {
    io.remove("missing")
    assert.equal(io.get("missing"), null)
  })

  it("supports array keys (LMDB-style composite)", () => {
    io.put(["__wal__", 0], { i: 0, payload: "p0" })
    io.put(["__wal__", 1], { i: 1, payload: "p1" })
    assert.deepEqual(io.get(["__wal__", 0]), { i: 0, payload: "p0" })
    assert.deepEqual(io.get(["__wal__", 1]), { i: 1, payload: "p1" })
  })

  it("preserves nested objects (no JSON round-trip)", () => {
    const obj = { nested: { deep: { v: 42 } }, arr: [1, 2, 3] }
    io.put("k", obj)
    const got = io.get("k")
    assert.deepEqual(got, obj)
  })
})

describe("DOIo: transaction()", () => {
  it("flushes pending puts to durable storage", async () => {
    const storage = new MockStorage()
    const io = await doKv(storage)
    await io.transaction(() => {
      io.put("a", 1)
      io.put("b", 2)
    })
    assert.equal(await storage.get("a"), 1)
    assert.equal(await storage.get("b"), 2)
  })

  it("flushes pending deletes to durable storage", async () => {
    const storage = new MockStorage()
    await storage.put({ keep: "y", drop: "z" })
    const io = await doKv(storage)
    await io.transaction(() => {
      io.remove("drop")
    })
    assert.equal(await storage.get("keep"), "y")
    assert.equal(await storage.get("drop"), undefined)
  })

  it("clears dirty sets after flush", async () => {
    const storage = new MockStorage()
    const io = await doKv(storage)
    io.put("k", 1)
    assert.equal(io.dirtyPuts.size, 1)
    await io.transaction(() => {})
    assert.equal(io.dirtyPuts.size, 0)
  })

  it("array-key writes survive a fresh DOIo on the same storage", async () => {
    const storage = new MockStorage()
    {
      const io = await doKv(storage)
      await io.transaction(() => {
        io.put(["__wal__", 0], { i: 0 })
        io.put(["__wal__", 1], { i: 1 })
      })
    }
    {
      const io2 = await doKv(storage)
      assert.deepEqual(io2.get(["__wal__", 0]), { i: 0 })
      assert.deepEqual(io2.get(["__wal__", 1]), { i: 1 })
    }
  })

  it("interleaved puts and deletes within a transaction land correctly", async () => {
    const storage = new MockStorage()
    await storage.put({ a: "old" })
    const io = await doKv(storage)
    await io.transaction(() => {
      io.put("a", "new")
      io.put("b", "fresh")
      io.remove("a")
      io.put("a", "newer")
    })
    assert.equal(await storage.get("a"), "newer")
    assert.equal(await storage.get("b"), "fresh")
  })
})

describe("DOIo: weavekv.js-shaped usage", () => {
  // weavekv.js synchronously reads and writes a few keys per request, then
  // calls io.transaction(() => { ... batch of puts ... }) at commit time.
  // These tests mirror that pattern.

  it("reads __meta__/current at construction equivalent", async () => {
    const storage = new MockStorage()
    await storage.put("__meta__/current", { i: 7, ts: 100 })
    const io = await doKv(storage)
    const meta = io.get("__meta__/current")
    assert.deepEqual(meta, { i: 7, ts: 100 })
  })

  it("simulates a commit batch (writes + WAL entries + meta bump)", async () => {
    const storage = new MockStorage()
    const io = await doKv(storage)

    // Pre-existing state
    await io.transaction(() => {
      io.put("__meta__/current", { i: 0, ts: 0 })
    })

    // Simulate a single commit cycle (mirrors weavekv.js commit())
    const i = 1
    const cl = { "users/bob": { name: "Bob" } }
    const __data = { i, opt: {}, cl, ts: 100, hashpath: null }

    await io.transaction(() => {
      for (const k in cl) io.put(k, cl[k])
      io.put(["__wal__", i], __data)
      io.put(["__priv_wal__", i], __data)
      io.put("__meta__/current", { i, ts: 100, hashpath: null })
    })

    // Verify durably
    assert.deepEqual(await storage.get("users/bob"), { name: "Bob" })
    assert.deepEqual(await storage.get("__wal__/1"), __data)
    assert.deepEqual(await storage.get("__priv_wal__/1"), __data)
    assert.deepEqual(await storage.get("__meta__/current"), {
      i: 1,
      ts: 100,
      hashpath: null,
    })
  })

  it("supports multiple sequential commits with monotonic indexes", async () => {
    const storage = new MockStorage()
    const io = await doKv(storage)

    for (let i = 1; i <= 5; i++) {
      await io.transaction(() => {
        io.put(["__wal__", i], { i, payload: `p${i}` })
        io.put("__meta__/current", { i, ts: i * 100 })
      })
    }

    for (let i = 1; i <= 5; i++) {
      assert.deepEqual(await storage.get(`__wal__/${i}`), {
        i,
        payload: `p${i}`,
      })
    }
    assert.equal((await storage.get("__meta__/current")).i, 5)
  })
})

describe("DOIo: regression hooks for weavekv.js semantics", () => {
  // These ensure the adapter's quirks match LMDB's exactly. If any of these
  // start to fail when weavekv.js is changed, the assumption is broken.

  it("io.get on a never-set key returns null (not undefined)", async () => {
    const io = await doKv(new MockStorage())
    assert.strictEqual(io.get("nope"), null)
  })

  it("io.put with explicit null is treated as a tombstone-by-value (not delete)", async () => {
    // weavekv.js does `del = k => put(k, null)`. So put(k, null) means delete.
    // The cache stores null; the next get() returns null. This is correct.
    const io = await doKv(new MockStorage())
    io.put("k", "v")
    io.put("k", null)
    assert.strictEqual(io.get("k"), null)
  })
})
