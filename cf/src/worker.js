// Side-effect import: installs a workerd-tolerant atob() shim. Must run
// before any module that uses atob (hbsig, core/src/utils.js).
import "./atob-polyfill.js"

// Worker entry. Routes incoming requests to the right ProcessDO instance
// (one DO per pid). Mirrors the public route surface of hb/src/server.js.
//
// Routes handled here (no DO needed):
//   GET  /status                    — node info
//
// Routes forwarded to the per-pid DO (id from request header `id`):
//   GET  /~weavedb@1.0/get          → DO /get
//   POST /~weavedb@1.0/set          → DO /set
//   GET  /~weavedb@1.0/zkp-inputs   → DO /zkp-inputs   (PR 3 of plan-cf.md)
//   GET  /~weavedb@1.0/replay       → DO /replay       (PR 5 of plan-cf.md)
//
// Scheduled (CF cron trigger) — see anchor.js:
//   scheduled(event, env, ctx)      — anchorAll → POST to env.ANCHOR_URL
//                                     (PR 7 of plan-cf.md)
//
// Not yet implemented (deferred):
//   POST /~weavedb@1.0/admin        — global admin
//   GET  /wal/:pid                  — WAL range read

import { anchorAll } from "./anchor.js"
export { ProcessDO } from "./process-do.js"

const STATUS_NAME = "WeaveDB"
const STATUS_VERSION = "0.0.1-cf"

export default {
  /**
   * @param {Request} req
   * @param {{ PROCESS_DO: DurableObjectNamespace, HB_URL: string, JWK?: string, ADMIN_ONLY?: string }} env
   * @param {ExecutionContext} ctx
   */
  async fetch(req, env, ctx) {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    if (method === "GET" && path === "/status") {
      return new Response(
        JSON.stringify({
          name: STATUS_NAME,
          version: STATUS_VERSION,
          "wal-url": env.HB_URL,
          "wal-type": "HyperBEAM",
          status: "ok",
        }),
        { headers: { "content-type": "application/json" } },
      )
    }

    if (
      (method === "GET" && path === "/~weavedb@1.0/get") ||
      (method === "POST" && path === "/~weavedb@1.0/set") ||
      (method === "GET" && path === "/~weavedb@1.0/zkp-inputs") ||
      (method === "GET" && path === "/~weavedb@1.0/replay")
    ) {
      const pid = req.headers.get("id")
      if (!pid) {
        return jsonResponse({ success: false, err: "missing id header" }, 400)
      }
      // Rewrite the path so the DO sees a simple internal route.
      const innerPath =
        path === "/~weavedb@1.0/get"
          ? "/get"
          : path === "/~weavedb@1.0/set"
            ? "/set"
            : path === "/~weavedb@1.0/zkp-inputs"
              ? "/zkp-inputs"
              : "/replay"
      const innerUrl = new URL(req.url)
      innerUrl.pathname = innerPath
      const innerReq = new Request(innerUrl, req)
      const id = env.PROCESS_DO.idFromName(pid)
      const stub = env.PROCESS_DO.get(id)
      return stub.fetch(innerReq)
    }

    return jsonResponse({ success: false, err: "not found" }, 404)
  },

  /**
   * CF cron trigger. Anchors each pid's head bundle root to L1 via the
   * webhook at env.ANCHOR_URL. If ANCHOR_URL is absent the run is a
   * dry-run that just logs candidates — useful for staging.
   *
   * Configure in wrangler.toml:
   *   [triggers]
   *   crons = ["0 * * * *"]   # hourly
   *
   * No-op without env.BUNDLES.
   */
  async scheduled(event, env, ctx) {
    if (!env.BUNDLES) {
      // eslint-disable-next-line no-console
      console.log("anchor cron: BUNDLES R2 binding missing; skipping")
      return
    }
    const work = anchorAll({
      bucket: env.BUNDLES,
      anchorUrl: env.ANCHOR_URL,
    }).then(results => {
      // eslint-disable-next-line no-console
      console.log(`anchor cron: ${results.length} pids processed`)
      for (const r of results) {
        // eslint-disable-next-line no-console
        console.log("  ", r.pid, r.status, "slot=", r.slot, r.err ?? "")
      }
    })
    // Keep the cron alive past `scheduled`'s return so anchors finish.
    if (typeof ctx?.waitUntil === "function") ctx.waitUntil(work)
    else await work
  },
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  })
}
