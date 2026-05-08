// WAL alarm handler. Pure logic; the DO wires it to state.storage.setAlarm().
//
// Mirrors hb/src/wal.js#commit():
//   1. Read __wal__/<h> keys starting from __meta__/height
//   2. Each entry has shape { opt: { headers, body }, hashpath, ts }
//   3. Skip if the entry has no signed headers (not yet ready to flush)
//   4. Bundle contiguous valid entries
//   5. POST bundle to HyperBEAM (hbClient.sendBundle)
//   6. On success, advance __meta__/height past the flushed range
//
// The hb/ version polls with a setTimeout(3s); the DO version is invoked
// from a 3s alarm (set after each successful flush, or when WAL writes
// land if no alarm is currently pending).

export const WAL_INTERVAL_MS = 3000

/**
 * Walk the WAL starting at `height`, collect contiguous signed entries.
 * Returns the bundle and the new height (= height + bundle.length).
 *
 * Pure function; takes the io adapter so it can be unit-tested.
 *
 * @param {object} io  The DOIo (or any sync get/io shape).
 * @param {number} height  Starting slot.
 */
export function collectBundle(io, height) {
  let h = height
  let d = null
  const bundle = []
  do {
    d = io.get(["__wal__", h]) ?? null
    if (
      d !== null &&
      d.opt?.headers &&
      typeof d.opt?.headers === "object" &&
      d.opt?.headers["signature"]
    ) {
      bundle.push({ ...d.opt, hashpath: d.hashpath, slot: h, ts: d.ts })
      h++
    } else {
      break
    }
  } while (d !== null)
  return { bundle, newHeight: h }
}

/**
 * Flush WAL once. Reads height, collects, sends, advances. Returns a
 * summary so callers can decide whether to reschedule sooner.
 *
 * @param {object} args
 * @param {object} args.io
 * @param {object} args.hbClient   HBClient or test fake
 * @param {string} args.pid
 */
export async function walFlush({ io, hbClient, pid }) {
  const height = io.get("__meta__/height") ?? 0
  const { bundle, newHeight } = collectBundle(io, height)
  if (bundle.length === 0) {
    return { flushed: 0, height, newHeight: height }
  }
  await hbClient.sendBundle({ pid, bundle })
  io.put("__meta__/height", newHeight)
  await io.flush()
  return { flushed: bundle.length, height, newHeight }
}

/**
 * Reschedule the next WAL alarm. Call after each flush or when new WAL
 * entries land. Idempotent — does nothing if an alarm is already pending
 * for ≤ now+interval.
 *
 * @param {DurableObjectStorage} storage
 */
export async function rescheduleWalAlarm(storage) {
  const existing = await storage.getAlarm()
  const target = Date.now() + WAL_INTERVAL_MS
  if (existing == null || existing > target) {
    await storage.setAlarm(target)
  }
}
