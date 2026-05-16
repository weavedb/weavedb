// HBClient — read-only HyperBEAM client for the CF rollup.
//
// In CF-native mode (plan-cf.md), the WAL commits to R2 via R2Archive,
// not to HyperBEAM. HBClient is therefore read-side only: it's used by
// recover-do.js to backfill missed messages from an HB-source pid at
// cold start, and is unused on the hot write path.
//
// Write side (sendBundle) was previously a throwing stub waiting on a
// signed ANS-104 DataItem path; PR 6 of plan-cf.md removed it. If you
// need a deployment that commits to HB, run the Node/Express rollup
// at `hb/src/server.js` instead — it has the full AO/Turbo write path
// via aoconnect.
//
// Mirrors the surface of hb/src/server-utils.js#getMsgs.

export class HBClient {
  /**
   * @param {object} opts
   * @param {string} opts.url     base URL, e.g. https://hb.wdb.ae:10002
   * @param {object} [opts.jwk]   operator JWK (kept for forward compat;
   *                              unused by getMsgs)
   * @param {typeof fetch} [opts.fetch] override (for tests)
   */
  constructor({ url, jwk, fetch: _fetch }) {
    this.url = url.replace(/\/+$/, "")
    this.jwk = jwk
    this.fetch = _fetch ?? fetch
  }

  /**
   * Fetch a window of scheduled messages for a process.
   * Mirrors hb/src/server-utils.js#getMsgs:
   *   GET ${hb}/~scheduler@1.0/schedule?target=${pid}&from=${from}&to=${to}
   * Returns the parsed body (typically { assignments: {...} }).
   *
   * @param {{pid: string, from?: number, to?: number}} args
   */
  async getMsgs({ pid, from = 0, to = 99 }) {
    const params = new URLSearchParams({ target: String(pid) })
    if (from) params.set("from", String(from))
    if (to) params.set("to", String(to))
    const res = await this.fetch(
      `${this.url}/~scheduler@1.0/schedule?${params.toString()}`,
    )
    if (!res.ok) {
      throw new Error(`HB getMsgs failed: ${res.status} ${await res.text()}`)
    }
    return await res.json()
  }
}

/**
 * Construct an HBClient from Worker env, with a sensible default.
 * @param {{HB_URL: string, JWK?: string}} env
 */
export function hbClientFromEnv(env) {
  return new HBClient({
    url: env.HB_URL,
    jwk: env.JWK ? parseJWK(env.JWK) : undefined,
  })
}

function parseJWK(jwk) {
  return typeof jwk === "string" ? JSON.parse(jwk) : jwk
}
