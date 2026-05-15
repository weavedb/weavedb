// WAL alarm handler. Pure logic; the DO wires it to state.storage.setAlarm().
//
// Mirrors hb/src/wal.js#commit():
//   1. Read __wal__/<h> keys starting from __meta__/height
//   2. Each entry has shape { opt: { headers, body }, hashpath, ts }
//   3. Skip if the entry has no signed headers (not yet ready to flush)
//   4. Bundle contiguous valid entries
//   5. Commit the bundle. Two modes, configurable per-DO:
//        - hbClient.sendBundle (Arweave-anchored mode, hb-parity)
//        - r2Archive.archiveBundle (CF-native mode, per plan-cf.md PR 2)
//      Either or both can be provided; both run on each flush when set.
//   6. On success, advance __meta__/height past the flushed range and,
//      for the R2 path, record __cf_meta__/last_archived_slot.
//
// The hb/ version polls with a setTimeout(3s); the DO version is invoked
// from a 3s alarm (set after each successful flush, or when WAL writes
// land if no alarm is currently pending).

export const WAL_INTERVAL_MS = 3000

/**
 * Persistent key — highest slot we've successfully archived to R2 (or -1).
 * Read by recovery to decide whether to skip already-archived slots.
 * Exported for tests and for any caller that needs to inspect bundle index.
 */
export const META_LAST_ARCHIVED_SLOT = "__cf_meta__/last_archived_slot"

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
 * Flush WAL once. Reads height, collects, commits, advances. Returns a
 * summary so callers can decide whether to reschedule sooner.
 *
 * Commit destinations are pluggable:
 *   - `hbClient`: if provided, POST the bundle to HyperBEAM via sendBundle.
 *   - `r2Archive`: if provided, write a serialized bundle to R2 under
 *     `bundles/<pid>/<head_slot>.bin` and record the head slot in
 *     `__cf_meta__/last_archived_slot`.
 * Either or both can be set. Both run on each flush — order is HB first,
 * then R2 — so failures upstream don't leave the R2 archive ahead of the
 * authoritative HB state in mixed deployments. If either throws, height
 * is NOT advanced and the next alarm retries.
 *
 * @param {object} args
 * @param {object} args.io                  DOIo
 * @param {object} [args.hbClient]          HBClient or test fake. Optional.
 * @param {object} [args.r2Archive]         R2Archive instance. Optional.
 * @param {string} args.pid
 */
export async function walFlush({ io, hbClient, r2Archive, pid }) {
  const height = io.get("__meta__/height") ?? 0
  const { bundle, newHeight } = collectBundle(io, height)
  if (bundle.length === 0) {
    return { flushed: 0, height, newHeight: height, archived: false }
  }
  if (!hbClient && !r2Archive) {
    throw new Error(
      "walFlush: at least one of hbClient or r2Archive must be provided",
    )
  }

  if (hbClient) await hbClient.sendBundle({ pid, bundle })

  let archived = false
  if (r2Archive) {
    // Head slot of this archived bundle is the highest slot we just
    // flushed (newHeight - 1). The R2 key zero-pads it so list() is
    // ordered by slot.
    const headSlot = newHeight - 1
    const buf = serializeBundle(bundle)
    const zkhash = await contentHash(buf)
    await r2Archive.archiveBundle({
      pid,
      slot: headSlot,
      zkhash,
      buf,
      ts: bundle[bundle.length - 1].ts ?? Date.now(),
    })
    io.put(META_LAST_ARCHIVED_SLOT, headSlot)
    archived = true
  }

  io.put("__meta__/height", newHeight)
  await io.flush()
  return { flushed: bundle.length, height, newHeight, archived }
}

/**
 * Serialize a bundle to the bytes we put in R2. JSON for now — readable,
 * inspectable from `wrangler r2 object get`, and good enough until the
 * arjson + brotli encoder (per hb/src/validate.js#buildBundle) is ported
 * to Workers in a later PR. The `recover-do.js` path will parse this back
 * via `deserializeBundle` so swap-in is mechanical when we upgrade.
 *
 * Each entry retains: { path, body, hashpath, slot, ts }. We strip
 * non-serializable headers down to a canonical lowercase form so two
 * runs against the same WAL produce byte-identical buf bytes (needed
 * for the content hash below to be deterministic).
 *
 * Exported for tests + recover-do.js.
 *
 * @param {Array<{path?: string, body: any, headers: object, hashpath: string, slot: number, ts: number}>} bundle
 * @returns {Uint8Array}
 */
export function serializeBundle(bundle) {
  const canon = bundle.map(e => ({
    path: e.path ?? null,
    headers: lowerCanonHeaders(e.headers),
    body: e.body ?? null,
    hashpath: e.hashpath ?? null,
    slot: e.slot,
    ts: e.ts,
  }))
  // Stable key ordering — JSON.stringify with sorted keys per entry.
  // We control the shape, so this is enough for a deterministic encoding
  // without pulling in canonicalize libs.
  return new TextEncoder().encode(JSON.stringify(canon))
}

/**
 * Reverse of serializeBundle. Used by recovery when reading from R2.
 */
export function deserializeBundle(buf) {
  const txt = new TextDecoder().decode(buf)
  return JSON.parse(txt)
}

function lowerCanonHeaders(h) {
  if (!h || typeof h !== "object") return {}
  const out = {}
  // Iterate in sorted key order so the JSON is stable across runtimes.
  for (const k of Object.keys(h).sort()) out[k.toLowerCase()] = h[k]
  return out
}

/**
 * Content-hash for the bundle bytes. Used as the bundle's `zkhash`
 * placeholder until PR 3 wires the SMT delta hash. Anyone holding the
 * archived buf can recompute and verify this — it's a SHA-256 hex string,
 * not yet a circuit-friendly Poseidon hash.
 *
 * Exported so tests can assert determinism without re-importing crypto.
 */
export async function contentHash(buf) {
  const digest = await crypto.subtle.digest("SHA-256", buf)
  const bytes = new Uint8Array(digest)
  let hex = ""
  for (const b of bytes) hex += b.toString(16).padStart(2, "0")
  return `sha256:${hex}`
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
