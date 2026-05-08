// ProcessDO — Durable Object class. One instance per WeaveDB process id (pid).
//
// Owns:
//   - per-pid state in DO storage (via the do-kv adapter)
//   - the core pipeline (db) bound to that storage
//   - init bootstrap (admin gate) and routing for set/get/status
//
// Does NOT yet handle (deferred to PR 3):
//   - WAL flush to HyperBEAM (DO alarm)
//   - Cold-start recovery from HyperBEAM
//   - /wal/:pid range-read endpoint
//
// The DO is single-threaded — no locking needed for the in-memory cache.

// Side-effect import: lenient atob shim. Loaded here too because Cloudflare
// may instantiate the DO class directly from process-do.js without first
// loading worker.js's globals.
import "./atob-polyfill.js"

import doKv from "./do-kv.js"
import { verify, toAddr } from "./auth.js"
import { hbClientFromEnv, HBClient } from "./hb-client.js"
import { walFlush, rescheduleWalAlarm } from "./wal-do.js"
import { recover } from "./recover-do.js"
// wdb-core is loaded via dynamic import inside ensureDB() so:
//   1. Tests that don't exercise the db (routing/state-only tests) don't
//      pull in core/'s transitive deps.
//   2. The Worker bundle still tree-shakes the same way at deploy time.
// Mirrors what hb/test/db-bare.js does — relative path to core/src/, bypassing
// the npm `wdb-core` boundary so we don't pull in Core (fs/path/zlib disk-cache
// machinery we don't need in a Worker).

const META_INITIALIZED = "__cf_meta__/initialized"
const META_OWNER = "__cf_meta__/owner"
const META_CREATED_AT = "__cf_meta__/created_at"
const META_PID = "__cf_meta__/pid"

export class ProcessDO {
  /**
   * @param {DurableObjectState} state
   * @param {{ HB_URL: string, BUNDLER_URL?: string, VALIDATOR_URL?: string, JWK?: string, ADMIN_ONLY?: string }} env
   */
  constructor(state, env) {
    this.state = state
    this.env = env
    this.io = null
    this.db = null
    /** Promise that resolves once init() has finished, or null if not yet started. */
    this.initPromise = null
    /** HBClient instance (lazy). Override-able in tests via `_setHBClient`. */
    this._hbClient = null
  }

  /** Test hook. */
  _setHBClient(client) {
    this._hbClient = client
  }

  hbClient() {
    if (!this._hbClient) {
      this._hbClient = this.env?.HB_URL ? hbClientFromEnv(this.env) : null
    }
    return this._hbClient
  }

  /**
   * Lazily build the io + kv + pipeline. Called on every request; the first
   * call hydrates the DOIo from durable storage and constructs the wdb pipeline.
   * Subsequent calls are a no-op.
   */
  async ensureDB() {
    if (this.db) return
    if (this.initPromise) {
      await this.initPromise
      return
    }
    this.initPromise = (async () => {
      this.io = await doKv(this.state.storage)
      // Use the cf-local db-main.js — main + noauth routes only. Avoids
      // pulling in the SST stage imports that transitively crash the
      // Workers bundle (see db-main.js for full rationale).
      const [
        { default: wkvFactory },
        { default: wdb },
        { default: queue },
      ] = await Promise.all([
        import("../../core/src/kv.js"),
        import("./db-main.js"),
        import("../../core/src/queue.js"),
      ])
      // Hand the io to the weavekv constructor (core/src/kv.js).
      // Sync callback rescheduleWalAlarm — when a write batch lands, we
      // ensure an alarm is queued. Best-effort; alarm machinery is robust
      // to repeated calls.
      const _methods = wkvFactory(this.io, async () => {
        try {
          await rescheduleWalAlarm(this.state.storage)
        } catch {
          /* ignore alarm scheduling errors; next write will retry */
        }
      })
      // queue() wraps wdb's raw {kv, res} into {success, err, res} that
      // handleSet / handleGet expect. Same shape Core.init produces in
      // hb/src/server.js.
      this.db = queue(wdb(_methods))
      // Replay any messages we missed while down. Best-effort.
      const pid = this._knownPid()
      const client = this.hbClient()
      if (pid && client && this.env?.SKIP_RECOVERY !== "true") {
        try {
          await recover({ io: this.io, hbClient: client, pid, db: this.db })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log("recover failed:", e)
        }
      }
    })()
    await this.initPromise
  }

  /**
   * Best-effort pid lookup. The DO doesn't get its name from state.id;
   * we record the pid on first init under META_PID and read it back here.
   */
  _knownPid() {
    return this.io?.get(META_PID) ?? null
  }

  /** Public entry. Receives a forwarded request from the Worker. */
  async fetch(req) {
    await this.ensureDB()
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    if (method === "GET" && path === "/status") return this.handleStatus()
    if (method === "GET" && path === "/get") return this.handleGet(req)
    if (method === "POST" && path === "/set") return this.handleSet(req)
    return jsonResponse({ success: false, err: "not found" }, 404)
  }

  /**
   * DO alarm callback — invoked by the runtime when the scheduled alarm
   * fires. Flushes the WAL to HyperBEAM. Reschedules if more work remains
   * or if the flush failed (so the next attempt happens within the interval).
   */
  async alarm() {
    await this.ensureDB()
    const pid = this._knownPid()
    const client = this.hbClient()
    if (!pid || !client) return
    try {
      const { flushed } = await walFlush({ io: this.io, hbClient: client, pid })
      if (flushed > 0) {
        // More may have arrived during the flush; queue another in case.
        await rescheduleWalAlarm(this.state.storage)
      }
    } catch (e) {
      // Reschedule so we retry next interval.
      // eslint-disable-next-line no-console
      console.log("wal flush failed:", e)
      await rescheduleWalAlarm(this.state.storage)
    }
  }

  handleStatus() {
    const initialized = this.io.get(META_INITIALIZED) === true
    return jsonResponse({
      success: true,
      initialized,
      owner: this.io.get(META_OWNER),
      created_at: this.io.get(META_CREATED_AT),
    })
  }

  /**
   * GET /get — read query.
   *
   * Mirrors hb/src/server.js's `/~weavedb@1.0/get` handler:
   *   const query = JSON.parse(req.headers.query ?? req.query.query)
   *   res.json(await dbs[id][query[0]](query.slice(1)))
   */
  async handleGet(req) {
    if (!this.io.get(META_INITIALIZED)) {
      return jsonResponse({ success: false, err: "db not initialized" }, 400)
    }
    const url = new URL(req.url)
    const queryHeader = req.headers.get("query") ?? url.searchParams.get("query")
    if (!queryHeader) {
      return jsonResponse({ success: false, err: "missing query" }, 400)
    }
    let query
    try {
      query = JSON.parse(queryHeader)
    } catch (e) {
      return jsonResponse({ success: false, err: "invalid query json" }, 400)
    }
    try {
      const op = query[0]
      const args = query.slice(1)
      const fn = this.db[op]
      if (typeof fn !== "function") {
        return jsonResponse(
          { success: false, err: `unknown op: ${op}` },
          400,
        )
      }
      const result = await fn(args)
      return jsonResponse(result)
    } catch (e) {
      return jsonResponse({ success: false, err: String(e) }, 500)
    }
  }

  /**
   * POST /set — signed write.
   *
   * Mirrors hb/src/server.js's `/~weavedb@1.0/set` handler:
   *   - verify signature
   *   - if query[0] === "init" and not yet initialized:
   *       - admin check (signer must equal operator JWK address) when ADMIN_ONLY
   *       - record initialized + owner + created_at
   *   - if initialized: dbs[pid].write(req)
   */
  async handleSet(req) {
    const v = await verify(req)
    if (!v.valid) {
      return jsonResponse(
        { success: false, err: "invalid signature", query: v.query, res: null },
        401,
      )
    }
    const initialized = this.io.get(META_INITIALIZED) === true
    const op = v.query?.[0]

    if (op === "init" && !initialized) {
      const adminOnly = (this.env.ADMIN_ONLY ?? "true") !== "false"
      if (adminOnly) {
        if (!this.env.JWK) {
          return jsonResponse(
            { success: false, err: "operator JWK not configured" },
            500,
          )
        }
        const operatorAddr = toAddr(parseJWK(this.env.JWK))
        if (operatorAddr !== v.address) {
          return jsonResponse(
            {
              success: false,
              err: "only node admin can add instances",
              res: null,
            },
            403,
          )
        }
      }
      // Mark initialized so subsequent calls take the write path.
      this.io.put(META_INITIALIZED, true)
      this.io.put(META_OWNER, v.address)
      this.io.put(META_CREATED_AT, v.ts)
      // Record pid (from id header) for later recovery and alarm flushes.
      // The DO's own id object doesn't carry the original name; we persist it.
      const pid = v.adapted.headers["id"]
      if (pid) this.io.put(META_PID, pid)
      // Run the init through the pipeline so the DB schema is created.
      try {
        const result = await this.db.write(buildPipelineReq(v))
        if (!result?.success) {
          // Roll back the meta flags if the pipeline rejected the init.
          this.io.put(META_INITIALIZED, false)
          this.io.put(META_OWNER, null)
          this.io.put(META_CREATED_AT, null)
          return jsonResponse(
            { success: false, err: result?.err, query: v.query, res: null },
            400,
          )
        }
        // Best-effort validator spawn — mirrors hb/src/server.js:172.
        if (this.env.VALIDATOR_URL && pid) {
          try {
            await fetch(
              `${this.env.VALIDATOR_URL}/spawn?id=${encodeURIComponent(pid)}`,
              { method: "GET" },
            )
          } catch {
            /* validator unreachable during init — non-fatal */
          }
        }
        return jsonResponse({ success: true, query: v.query, res: result.result })
      } catch (e) {
        this.io.put(META_INITIALIZED, false)
        this.io.put(META_OWNER, null)
        this.io.put(META_CREATED_AT, null)
        return jsonResponse(
          { success: false, query: v.query, err: String(e), res: null },
          500,
        )
      }
    }

    if (!initialized) {
      return jsonResponse(
        { success: false, err: "db not initialized" },
        400,
      )
    }

    try {
      const result = await this.db.write(buildPipelineReq(v))
      if (result?.success) {
        return jsonResponse({ success: true, query: v.query, res: result.result })
      }
      return jsonResponse(
        { success: false, err: result?.err, query: v.query, res: null },
        400,
      )
    } catch (e) {
      return jsonResponse(
        { success: false, query: v.query, err: String(e), res: null },
        500,
      )
    }
  }
}

/**
 * Build the request shape that core/src/dev_normalize.js expects.
 * The core pipeline reads `req.headers` and `req.body` off this object.
 */
function buildPipelineReq(verified) {
  return {
    headers: verified.adapted.headers,
    body: verified.adapted.body,
  }
}

function parseJWK(jwk) {
  if (typeof jwk === "string") return JSON.parse(jwk)
  return jwk
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  })
}
