// R2Archive — durable bundle store for the CF rollup.
//
// The Node/Express rollup commits finalized bundles to HyperBEAM via a
// signed ANS-104 DataItem (hb/src/wal.js → hbClient.sendBundle). The CF
// rollup replaces that step with an R2 PUT: each finalized bundle becomes
// an immutable object at `bundles/<pid>/<slot>.bin`, with `{zkhash, ts}`
// in R2 custom metadata and the arjson-encoded delta bytes in the body.
//
// This file is the pure binding wrapper. Callers (process-do.js,
// recover-do.js, worker.js /replay) get a small typed API that abstracts
// R2 key layout and metadata encoding so the rest of the code never
// hand-rolls keys.
//
// All slot numbers are zero-padded to 12 digits in the key so that
// `list()` returns objects in ascending slot order without a sort.
//
// Mirrors the role of HBClient on the read side (getMsgs → listBundles +
// readBundle) and replaces it on the write side (sendBundle →
// archiveBundle). PR 2 will wire the DO alarm to call archiveBundle on
// each WAL flush.

const SLOT_PAD = 12

/** @typedef {{ zkhash: string, buf: Uint8Array, ts: number }} Bundle */

/**
 * Build the canonical R2 key for a (pid, slot) pair.
 * Exported for tests and for callers that want to construct GET URLs
 * without going through this class.
 */
export function bundleKey(pid, slot) {
  if (!pid || typeof pid !== "string") {
    throw new TypeError("bundleKey: pid must be a non-empty string")
  }
  if (!Number.isInteger(slot) || slot < 0) {
    throw new TypeError(`bundleKey: slot must be a non-negative integer, got ${slot}`)
  }
  return `bundles/${pid}/${String(slot).padStart(SLOT_PAD, "0")}.bin`
}

/**
 * Parse a bundle key back into (pid, slot). Returns null on shape mismatch.
 * Useful when iterating `list()` results.
 */
export function parseBundleKey(key) {
  const m = /^bundles\/([^/]+)\/(\d{12})\.bin$/.exec(key)
  if (!m) return null
  return { pid: m[1], slot: Number(m[2]) }
}

export class R2Archive {
  /**
   * @param {R2Bucket} bucket  the R2Bucket binding from Worker env
   */
  constructor(bucket) {
    if (!bucket) throw new TypeError("R2Archive: bucket binding is required")
    this.bucket = bucket
  }

  /**
   * Write a finalized bundle. Idempotent on the (pid, slot) key —
   * re-archiving the same slot overwrites in place. Callers should
   * treat the slot as already-archived once this resolves.
   *
   * @param {{pid: string, slot: number, zkhash: string, buf: Uint8Array, ts?: number}} args
   * @returns {Promise<{key: string, etag: string}>}
   */
  async archiveBundle({ pid, slot, zkhash, buf, ts }) {
    if (typeof zkhash !== "string" || zkhash.length === 0) {
      throw new TypeError("archiveBundle: zkhash must be a non-empty string")
    }
    if (!(buf instanceof Uint8Array)) {
      throw new TypeError("archiveBundle: buf must be a Uint8Array")
    }
    const key = bundleKey(pid, slot)
    const _ts = Number.isFinite(ts) ? Math.floor(ts) : Date.now()
    const out = await this.bucket.put(key, buf, {
      customMetadata: {
        zkhash,
        ts: String(_ts),
        slot: String(slot),
        pid,
      },
    })
    // Workers R2 returns either an R2Object (with etag) or null on
    // failure for some bucket impls. Normalize to a uniform return.
    return { key, etag: out?.etag ?? null }
  }

  /**
   * Read a bundle by (pid, slot). Returns null if the object is absent.
   *
   * @param {{pid: string, slot: number}} args
   * @returns {Promise<Bundle | null>}
   */
  async readBundle({ pid, slot }) {
    const key = bundleKey(pid, slot)
    const obj = await this.bucket.get(key)
    if (!obj) return null
    const meta = obj.customMetadata ?? {}
    const buf = new Uint8Array(await obj.arrayBuffer())
    const tsRaw = meta.ts
    const ts = tsRaw === undefined ? null : Number(tsRaw)
    return {
      zkhash: meta.zkhash ?? null,
      buf,
      ts: Number.isFinite(ts) ? ts : null,
    }
  }

  /**
   * List archived slots for a pid in [from, to] (both inclusive),
   * sorted ascending. Returns lightweight entries — no body bytes
   * fetched. Use readBundle() to pull the buf for any specific slot.
   *
   * R2's list cursor pagination is folded internally; callers don't
   * need to deal with cursors for typical bundle-history sizes. If you
   * really expect > a few thousand bundles in one call, prefer
   * iterating with explicit from/to windows.
   *
   * @param {{pid: string, from?: number, to?: number, limit?: number}} args
   * @returns {Promise<Array<{slot: number, key: string, zkhash: string | null, ts: number | null, size: number}>>}
   */
  async listBundles({ pid, from = 0, to = Infinity, limit } = {}) {
    if (!pid) throw new TypeError("listBundles: pid is required")
    const prefix = `bundles/${pid}/`
    const startAfter =
      from > 0
        ? `${prefix}${String(from - 1).padStart(SLOT_PAD, "0")}.bin`
        : undefined
    const out = []
    let cursor
    // R2 list returns up to 1000 by default; loop for completeness.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const listing = await this.bucket.list({
        prefix,
        startAfter: cursor ? undefined : startAfter,
        cursor,
        include: ["customMetadata"],
      })
      for (const obj of listing.objects ?? []) {
        const parsed = parseBundleKey(obj.key)
        if (!parsed) continue
        if (parsed.slot < from) continue
        if (parsed.slot > to) {
          // Sorted ascending — once we pass `to`, we can stop.
          return out
        }
        const meta = obj.customMetadata ?? {}
        const ts = meta.ts === undefined ? null : Number(meta.ts)
        out.push({
          slot: parsed.slot,
          key: obj.key,
          zkhash: meta.zkhash ?? null,
          ts: Number.isFinite(ts) ? ts : null,
          size: obj.size ?? 0,
        })
        if (limit && out.length >= limit) return out
      }
      if (!listing.truncated) break
      cursor = listing.cursor
    }
    return out
  }

  /**
   * Highest archived slot for a pid, or -1 if none. Convenience wrapper
   * used by recovery to decide where to resume the replay from.
   */
  async headSlot({ pid }) {
    // Walk backwards from "all bundles" — list is ascending, so just
    // take the last entry. For pid registries with millions of bundles
    // this would warrant a separate index; for early CF it's fine.
    const all = await this.listBundles({ pid })
    return all.length === 0 ? -1 : all[all.length - 1].slot
  }
}

export default R2Archive
