// HBClient — abstracts the Worker's HTTP conversation with HyperBEAM.
//
// Read side (getMsgs) — plain HTTPS GET, fully implemented, used by recover.
// Write side (sendBundle) — needs a signed ANS-104 DataItem POSTed to HB,
//   which currently lives in @permaweb/aoconnect. PR 4 will wire that in
//   (either via wao under nodejs_compat or via a Web-Crypto port). Until
//   then sendBundle throws — the WAL alarm calls it but tests inject a
//   fake client.
//
// Mirrors the surface of hb/src/server-utils.js#getMsgs and the
// hb/src/wal.js#commit hb.message() call site, kept compatible so that
// PR 4 can swap implementations without changes upstream.

export class HBClient {
  /**
   * @param {object} opts
   * @param {string} opts.url     base URL, e.g. https://hb.wdb.ae:10002
   * @param {object} [opts.jwk]   operator JWK (used by sendBundle in PR 4)
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

  /**
   * Send a WAL bundle to HyperBEAM.
   *
   * Today: NOT implemented. Throws so the WAL alarm logs and reschedules
   * cleanly. PR 4 wires the signed-DataItem path.
   *
   * @param {{pid: string, bundle: any[]}} args
   * @returns {Promise<{slot: number, pid: string}>}
   */
  async sendBundle(/* { pid, bundle } */) {
    throw new Error(
      "HBClient.sendBundle not yet implemented (PR 4: signed AO DataItem path)",
    )
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
