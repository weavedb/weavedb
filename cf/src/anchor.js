// Anchor — periodic on-chain commitment of bundle roots.
//
// Per plan-cf.md "Optional: on-chain anchor": a CF cron walks R2 for
// the latest archived bundle of each pid and submits the `zkhash`
// (Merkle root) to an L1 anchor. This module is the Worker-side
// orchestrator; the actual signing + L1 RPC call lives behind a
// webhook (`env.ANCHOR_URL`) so the Worker doesn't need to carry an
// Ethereum key or Arweave wallet.
//
// Why a webhook instead of inline signing:
//   - Keeps the L1-specific machinery out of the Worker bundle.
//   - The same Worker can anchor to Ethereum, Arweave, or both by
//     pointing ANCHOR_URL at a thin signing service.
//   - The signing service can batch, throttle, and retry without
//     reaching into Worker internals.
//
// What the cron does:
//   1. Discover active pids by listing R2 `bundles/<pid>/`.
//   2. For each pid: read the head bundle's `zkhash` + metadata.
//   3. POST {pid, slot, zkhash, ts} to ANCHOR_URL.
//   4. Track last-anchored-slot per pid in R2 at `anchors/<pid>.json`
//      so we don't re-anchor the same head on every cron tick.
//
// Dry-run when ANCHOR_URL is absent: logs each candidate. Lets you
// confirm the iteration logic is right before wiring a real L1
// service. Tests rely on this — they supply a mock webhook via the
// `fetch` param.

import { parseBundleKey, R2Archive } from "./r2-archive.js"

/**
 * R2 key prefix for the anchor-state-per-pid file.
 * Each file is JSON: `{lastAnchoredSlot: N, lastAnchoredAt: T}`.
 */
const ANCHOR_STATE_PREFIX = "anchors/"

/**
 * List unique pids that have at least one archived bundle in R2.
 *
 * Walks `bundles/<pid>/*` with prefix paging until exhausted. Returns
 * an array of pid strings (no duplicates, no ordering guarantees —
 * callers sort if they want determinism).
 *
 * @param {R2Bucket} bucket
 * @returns {Promise<string[]>}
 */
export async function listPids(bucket) {
  const seen = new Set()
  let cursor
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const listing = await bucket.list({ prefix: "bundles/", cursor })
    for (const obj of listing.objects ?? []) {
      const parsed = parseBundleKey(obj.key)
      if (parsed) seen.add(parsed.pid)
    }
    if (!listing.truncated) break
    cursor = listing.cursor
  }
  return [...seen]
}

/**
 * Read the persisted anchor state for a pid, or `null` if never anchored.
 * @param {R2Bucket} bucket
 * @param {string} pid
 * @returns {Promise<{lastAnchoredSlot: number, lastAnchoredAt: number} | null>}
 */
export async function readAnchorState(bucket, pid) {
  const obj = await bucket.get(`${ANCHOR_STATE_PREFIX}${pid}.json`)
  if (!obj) return null
  try {
    return JSON.parse(await obj.text())
  } catch {
    return null
  }
}

/**
 * Persist anchor state for a pid.
 * @param {R2Bucket} bucket
 * @param {string} pid
 * @param {{lastAnchoredSlot: number, lastAnchoredAt: number}} state
 */
export async function writeAnchorState(bucket, pid, state) {
  await bucket.put(
    `${ANCHOR_STATE_PREFIX}${pid}.json`,
    JSON.stringify(state),
    { customMetadata: { pid } },
  )
}

/**
 * Anchor a single pid: fetches its head bundle and submits to the
 * webhook iff the head slot has advanced since the last anchor.
 *
 * Returns one of:
 *   { pid, status: "anchored", slot, zkhash }
 *   { pid, status: "skipped",  slot, reason: "no bundles" | "head already anchored" }
 *   { pid, status: "dry-run",  slot, zkhash }
 *   { pid, status: "error",    err }
 *
 * @param {object} args
 * @param {string} args.pid
 * @param {R2Bucket} args.bucket
 * @param {string} [args.anchorUrl]   webhook URL; if absent → dry-run
 * @param {typeof fetch} [args.fetch] override for tests
 */
export async function anchorPid({ pid, bucket, anchorUrl, fetch: _fetch }) {
  const archive = new R2Archive(bucket)
  const head = await archive.headSlot({ pid })
  if (head < 0) return { pid, status: "skipped", slot: -1, reason: "no bundles" }

  const state = await readAnchorState(bucket, pid)
  if (state && state.lastAnchoredSlot >= head) {
    return {
      pid,
      status: "skipped",
      slot: head,
      reason: "head already anchored",
    }
  }

  const bundle = await archive.readBundle({ pid, slot: head })
  if (!bundle) {
    return {
      pid,
      status: "skipped",
      slot: head,
      reason: "head bundle missing (raced with archive?)",
    }
  }

  const payload = { pid, slot: head, zkhash: bundle.zkhash, ts: bundle.ts }

  if (!anchorUrl) {
    // eslint-disable-next-line no-console
    console.log("anchor dry-run:", JSON.stringify(payload))
    return { pid, status: "dry-run", slot: head, zkhash: bundle.zkhash }
  }

  const f = _fetch ?? fetch
  let res
  try {
    res = await f(anchorUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    return { pid, status: "error", err: String(e) }
  }
  if (!res.ok) {
    return {
      pid,
      status: "error",
      err: `anchor ${res.status}: ${(await res.text()).slice(0, 200)}`,
    }
  }

  await writeAnchorState(bucket, pid, {
    lastAnchoredSlot: head,
    lastAnchoredAt: Date.now(),
  })
  return { pid, status: "anchored", slot: head, zkhash: bundle.zkhash }
}

/**
 * Anchor every pid discovered in R2. Returns a per-pid result array.
 *
 * Pids are processed sequentially to keep the burst rate against the
 * webhook predictable. Errors on one pid don't stop the others.
 *
 * @param {object} args
 * @param {R2Bucket} args.bucket
 * @param {string} [args.anchorUrl]
 * @param {typeof fetch} [args.fetch]
 */
export async function anchorAll({ bucket, anchorUrl, fetch: _fetch }) {
  const pids = await listPids(bucket)
  const results = []
  for (const pid of pids) {
    results.push(
      await anchorPid({ pid, bucket, anchorUrl, fetch: _fetch }),
    )
  }
  return results
}
