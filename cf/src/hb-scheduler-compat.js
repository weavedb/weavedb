// HB Scheduler compatibility layer.
//
// Exposes the R2-archived WAL of the CF rollup in the same shape that
// HyperBEAM's `/~scheduler@1.0/schedule?target=&from=&to=` returns,
// so the existing `hb/src/validate.js` validator can subscribe to a
// CF deployment without code changes.
//
// HB's shape (what validate.js + recover-do.js consume via getMsgs):
//   {
//     assignments: {
//       "<slot>": {
//         slot: N,
//         body: { data: "<JSON-encoded entries array>" }
//       },
//       ...
//     }
//   }
//
// Each `m.body.data` is a JSON string of entries; each entry has its
// own `slot` field. The validator's onslot() splits the JSON list and
// stores each entry by its slot, so we can emit either one entry per
// assignment or several — the validator handles both.
//
// We emit ONE assignment per entry, keyed by the entry's slot, so the
// shape is identical to what HB's scheduler actually produces. R2
// bundles are unpacked: a bundle archived at slot 5 containing entries
// at slots 2,3,4,5 turns into four assignments here.
//
// This gives full HB parity:
//   1. CF rollup writes WAL → R2 (PR 1-2).
//   2. hb/src/validate.js points HB_URL at the CF Worker URL.
//   3. Validator subscribes via getMsgs (this route), replays through
//      its local pipeline, produces SMT-derived `zkhash` bundles via
//      `buildBundle()` exactly as it does against real HB.
//
// The validator's bundles are a separate log; this route doesn't
// expose them. PR 9 could add a "POST signed-bundle" endpoint to
// store them in R2 alongside the entry archive.

import { R2Archive } from "./r2-archive.js"
import { deserializeBundle } from "./wal-do.js"

/**
 * Build the HB getMsgs response for a (pid, from, to) window from R2.
 *
 * @param {object} args
 * @param {R2Bucket} args.bucket   env.BUNDLES R2 binding
 * @param {string} args.pid
 * @param {number} [args.from=0]
 * @param {number} [args.to=Infinity]
 * @param {number} [args.limit]    cap total entries (not bundles)
 * @returns {Promise<{assignments: Record<string, {slot: number, body: {data: string}}>}>}
 */
export async function getMsgsFromR2({ bucket, pid, from = 0, to = Infinity, limit } = {}) {
  if (!bucket) throw new TypeError("getMsgsFromR2: bucket required")
  if (!pid) throw new TypeError("getMsgsFromR2: pid required")

  const archive = new R2Archive(bucket)
  // listBundles returns bundle-head slots in ascending order. We need
  // to consider any bundle whose head >= `from` because a bundle at
  // head=10 may contain entries from slot 5..10. So we walk from
  // bundle head 0 and skip until we find ones containing relevant slots.
  // Memory-frugal: pull bundles one at a time.
  const bundleHeads = await archive.listBundles({ pid, from: 0, to: Infinity })

  const assignments = {}
  let emitted = 0
  for (const head of bundleHeads) {
    if (head.slot < from) {
      // Even the head < from means no entries in this bundle are in range.
      continue
    }
    const stored = await archive.readBundle({ pid, slot: head.slot })
    if (!stored) continue
    let entries
    try {
      entries = deserializeBundle(stored.buf)
    } catch {
      continue
    }
    for (const e of entries) {
      const slot = e.slot
      if (slot < from || slot > to) continue
      assignments[String(slot)] = {
        slot,
        body: { data: JSON.stringify([e]) },
      }
      emitted += 1
      if (limit && emitted >= limit) {
        return { assignments }
      }
    }
  }
  return { assignments }
}

/**
 * HTTP handler for GET /~scheduler@1.0/schedule.
 *
 * Returns 400 on missing `target` (the pid), 503 if no BUNDLES R2
 * binding is configured. Body matches HB's getMsgs format so
 * hb/src/validate.js can consume it with no patches.
 */
export async function handleScheduleRequest(req, env) {
  if (!env?.BUNDLES) {
    return new Response(
      JSON.stringify({ success: false, err: "R2 archive not configured" }),
      {
        status: 503,
        headers: { "content-type": "application/json" },
      },
    )
  }
  const url = new URL(req.url)
  const pid = url.searchParams.get("target")
  if (!pid) {
    return new Response(
      JSON.stringify({ success: false, err: "missing target (pid) param" }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      },
    )
  }
  const fromRaw = url.searchParams.get("from")
  const toRaw = url.searchParams.get("to")
  const limitRaw = url.searchParams.get("limit")
  const from = fromRaw == null ? 0 : Number.parseInt(fromRaw, 10)
  const to = toRaw == null ? Infinity : Number.parseInt(toRaw, 10)
  const limit = limitRaw == null ? undefined : Number.parseInt(limitRaw, 10)

  try {
    const body = await getMsgsFromR2({
      bucket: env.BUNDLES,
      pid,
      from: Number.isFinite(from) ? from : 0,
      to: Number.isFinite(to) ? to : Infinity,
      limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
    })
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, err: String(e) }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    )
  }
}
