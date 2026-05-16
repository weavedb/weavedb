// Cold-start recovery. Replays missed messages from either HyperBEAM
// (legacy / hb-anchored mode) or R2 (CF-native mode) into DO storage.
//
// Mirrors hb/src/recover.js but adapted for the DO:
//   - Uses HBClient (plain fetch) for HB mode, R2Archive for CF-native
//   - Replays into an already-constructed db (no Core/version handling here;
//     the DO instantiates db via dynamic import in process-do.js)
//   - Returns a height — caller persists it to __meta__/height
//
// Recovery sources (one, the other, or both — they're additive):
//   - hbClient → walks HB scheduler via paginated getMsgs
//   - r2Archive → walks R2 bundles produced by walFlush
//
// When both are provided we run HB first (it's the historical source
// of truth in mixed deployments), then R2. R2 is idempotent — entries
// already replayed via HB are skipped by the height counter.
//
// Called from process-do.js's ensureDB() inside state.blockConcurrencyWhile,
// so concurrent fetches block until replay completes (matches the DO
// single-threaded actor model).

import { deserializeBundle } from "./wal-do.js"
import { META_LAST_ARCHIVED_SLOT } from "./wal-do.js"

const PAGE_SIZE = 20

/**
 * @param {object} args
 * @param {object} args.io                DOIo adapter (already hydrated)
 * @param {object} [args.hbClient]        HBClient (HB-anchored mode)
 * @param {object} [args.r2Archive]       R2Archive (CF-native mode)
 * @param {string} args.pid
 * @param {object} args.db                The wdb pipeline (db.write available)
 */
export async function recover({ io, hbClient, r2Archive, pid, db }) {
  let height = io.get("__meta__/height") ?? 0
  let totalReplayed = 0
  let firstError = null

  // 1. HB-anchored recovery — paginated subscribe to the scheduler.
  if (hbClient) {
    const hbRes = await recoverFromHB({ io, hbClient, pid, db, startHeight: height })
    height = hbRes.height
    totalReplayed += hbRes.replayed
    if (hbRes.error && !firstError) firstError = hbRes.error
  }

  // 2. R2-native recovery — walk archived bundles. Idempotent: the
  //    height counter ensures already-replayed entries are skipped.
  //    Reads __meta__/height from storage directly so it picks up
  //    anything HB recovery wrote.
  if (r2Archive) {
    const r2Res = await recoverFromR2({ io, r2Archive, pid, db })
    if (r2Res.height > -1) height = r2Res.height
    totalReplayed += r2Res.replayed
    if (r2Res.error && !firstError) firstError = r2Res.error
  }

  await io.flush()
  return firstError == null
    ? { height, replayed: totalReplayed }
    : { height, replayed: totalReplayed, error: firstError }
}

/**
 * Original HB-based recovery, extracted so the multi-source recover()
 * stays small.
 */
async function recoverFromHB({ io, hbClient, pid, db, startHeight }) {
  let i = 0
  let height = startHeight
  let from = 0
  let to = PAGE_SIZE - 1

  let page
  try {
    page = await hbClient.getMsgs({ pid, from, to })
  } catch (e) {
    // No HB / unreachable / 404 for unknown pid → fresh DB, nothing to replay.
    return { height, replayed: 0, error: String(e) }
  }

  while (page?.assignments && Object.keys(page.assignments).length > 0) {
    for (const k in page.assignments) {
      const m = page.assignments[k]
      if (!m.body?.data) continue
      let entries
      try {
        entries = JSON.parse(m.body.data)
      } catch {
        continue
      }
      for (const v of entries) {
        if (i >= height) {
          try {
            await db.write(v)
            height = i
          } catch (e) {
            // Match recover.js's behavior: log and continue. A bad message
            // shouldn't block recovery of subsequent good messages.
            // eslint-disable-next-line no-console
            console.log("recover replay error at slot", i, e)
          }
        }
        i++
      }
    }
    if (i > startHeight) {
      io.put("__meta__/height", i)
    }
    from += PAGE_SIZE
    to += PAGE_SIZE
    try {
      page = await hbClient.getMsgs({ pid, from, to })
    } catch {
      break
    }
  }
  return { height, replayed: i }
}

/**
 * R2-native recovery. Walks archived bundles, deserializes each, and
 * replays each entry through `db.write`. Advances both
 * `__meta__/height` and `__cf_meta__/last_archived_slot` so the next
 * alarm doesn't re-archive what's already been replayed.
 *
 * Idempotent on `__meta__/height` — an entry at slot S is replayed
 * iff S >= height when its turn comes up.
 */
async function recoverFromR2({ io, r2Archive, pid, db }) {
  // Read storage directly so we pick up anything HB recovery already
  // wrote. HB uses `i` (count) as `__meta__/height`; R2 reuses it as
  // the slot floor — entries with `v.slot < height` are skipped.
  const startHeight = io.get("__meta__/height") ?? 0
  let height = startHeight
  let replayed = 0
  let lastArchivedSlot = io.get(META_LAST_ARCHIVED_SLOT) ?? -1
  let lastWrittenSlot = -1

  let bundleEntries
  try {
    bundleEntries = await r2Archive.listBundles({ pid })
  } catch (e) {
    return { height: lastWrittenSlot, replayed, error: String(e) }
  }

  for (const meta of bundleEntries) {
    let stored
    try {
      stored = await r2Archive.readBundle({ pid, slot: meta.slot })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("recover: failed to read R2 bundle", meta.slot, e)
      continue
    }
    if (!stored) continue
    let entries
    try {
      entries = deserializeBundle(stored.buf)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("recover: bad R2 bundle bytes at slot", meta.slot, e)
      continue
    }
    for (const v of entries) {
      if (v.slot < height) continue // already applied (e.g. via HB recovery)
      try {
        // serializeBundle stores entries as {path, headers, body, hashpath, slot, ts}.
        // db.write expects a request-shaped object with { headers, body }.
        await db.write({ headers: v.headers ?? {}, body: v.body ?? "" })
        lastWrittenSlot = v.slot
        height = v.slot + 1
        replayed += 1
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("recover: R2 replay error at slot", v.slot, e)
      }
    }
    if (meta.slot > lastArchivedSlot) lastArchivedSlot = meta.slot
  }

  if (height > startHeight) {
    io.put("__meta__/height", height)
    io.put(META_LAST_ARCHIVED_SLOT, lastArchivedSlot)
  }
  // Return the last slot written (consistent with HB recovery's
  // return value semantics).
  return { height: lastWrittenSlot, replayed }
}
