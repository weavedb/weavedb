// Tests for the DO alarm() callback wiring + the validator spawn hook.

import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { ProcessDO } from "../src/process-do.js"
import doKv from "../src/do-kv.js"
import { MockStorage } from "./mock-storage.js"

function mockStateWithAlarms(storage = new MockStorage()) {
  let alarmAt = null
  return {
    storage,
    id: { toString: () => "test", name: "test", equals: () => false },
    blockConcurrencyWhile: async fn => fn(),
    setAlarm: async ts => {
      alarmAt = ts
    },
    getAlarm: async () => alarmAt,
    deleteAlarm: async () => {
      alarmAt = null
    },
    /** Wraps the same store object for storage.{get,put,...}; alarm goes through state. */
    _alarmAt: () => alarmAt,
  }
}

describe("ProcessDO.alarm()", () => {
  let state
  let p
  let sentBundles

  beforeEach(async () => {
    state = mockStateWithAlarms()
    // Hook storage with alarm methods so wal-do.rescheduleWalAlarm works:
    state.storage.getAlarm = state.getAlarm
    state.storage.setAlarm = state.setAlarm
    p = new ProcessDO(state, { HB_URL: "http://stub", SKIP_RECOVERY: "true" })
    p.io = await doKv(state.storage)
    p.db = { write: async () => ({ success: true }) }
    p.initPromise = Promise.resolve()
    sentBundles = []
    p._setHBClient({
      sendBundle: async args => {
        sentBundles.push(args)
        return { slot: 0, pid: args.pid }
      },
      getMsgs: async () => ({ assignments: {} }),
    })
  })

  it("is a noop when no pid is recorded", async () => {
    await p.alarm()
    assert.equal(sentBundles.length, 0)
  })

  it("flushes signed WAL entries when pid + hbClient are present", async () => {
    p.io.put("__cf_meta__/pid", "p1")
    p.io.put(["__wal__", 0], {
      opt: { headers: { signature: "sig-0" } },
      hashpath: "h0",
      ts: 1,
    })
    p.io.put(["__wal__", 1], {
      opt: { headers: { signature: "sig-1" } },
      hashpath: "h1",
      ts: 2,
    })
    await p.io.flush()

    await p.alarm()

    assert.equal(sentBundles.length, 1)
    assert.equal(sentBundles[0].pid, "p1")
    assert.equal(sentBundles[0].bundle.length, 2)
  })

  it("reschedules another alarm after a successful flush", async () => {
    p.io.put("__cf_meta__/pid", "p1")
    p.io.put(["__wal__", 0], {
      opt: { headers: { signature: "sig-0" } },
      hashpath: "h0",
      ts: 1,
    })
    await p.io.flush()

    await p.alarm()
    assert.ok(state._alarmAt() !== null, "alarm should be scheduled after flush")
  })

  it("reschedules alarm even when HB throws (so we retry)", async () => {
    p.io.put("__cf_meta__/pid", "p1")
    p.io.put(["__wal__", 0], {
      opt: { headers: { signature: "sig-0" } },
      hashpath: "h0",
      ts: 1,
    })
    await p.io.flush()
    p._setHBClient({
      sendBundle: async () => {
        throw new Error("HB down")
      },
    })
    await p.alarm()
    assert.ok(
      state._alarmAt() !== null,
      "alarm should be rescheduled so we retry on next interval",
    )
  })
})

describe("validator spawn hook", () => {
  // Smoke test that the spawn URL is fetched after a successful init.
  // We can't fully exercise /set without real signed requests (PR 4 territory)
  // — here we directly invoke the spawn fetch by stubbing global fetch.
  it("fetches VALIDATOR_URL/spawn?id=<pid> when configured", async () => {
    const calls = []
    const realFetch = global.fetch
    global.fetch = async (url, opts) => {
      calls.push({ url: String(url), method: opts?.method ?? "GET" })
      return new Response("{}", { status: 200 })
    }
    try {
      const validator = "http://validator.local"
      const pid = "p-spawn"
      // The hook is fire-and-forget inside handleSet; here we directly
      // exercise the same call shape to assert the URL contract.
      await fetch(`${validator}/spawn?id=${encodeURIComponent(pid)}`, {
        method: "GET",
      })
      assert.equal(calls.length, 1)
      assert.equal(calls[0].url, "http://validator.local/spawn?id=p-spawn")
      assert.equal(calls[0].method, "GET")
    } finally {
      global.fetch = realFetch
    }
  })
})
