# weavedb-cf — Cloudflare Worker + Durable Object rollup

The default Cloudflare deployment target for the WeaveDB rollup component.

## Status

PR 4 of 4 in the `feat/cf-rollup` series. **70 pass, 3 skip, 0 fail**.

- [x] **PR 1**: `do-kv` adapter — sync KV over async DO storage. 24 unit tests.
- [x] **PR 2**: Worker + DO skeleton — routing, signature verify, init/get/set, lazy db construction. 13 unit tests.
- [x] **PR 3**: WAL alarm + cold-start recovery + validator spawn hook. 24 unit tests.
- [x] **PR 4a**: Miniflare integration — real workerd boot test. 6 tests pass. Surfaced the SST/`zkjson` `Worker is not defined` bundle issue, fixed via `db-main.js` (NoSQL-only pipeline).
- [x] **PR 4b**: Full signed E2E pipeline — **init runs end-to-end through verify → normalize → parse → auth → write → init → store inside workerd**. 3 mkdir/set/get tests skipped pending an upstream `hbsig` atob fix.

## Status of the 3 skipped tests

The atob bug is **fixed** — when `./scripts/patch-atob.sh` is applied, all `atob()` call sites in npm packages (hbsig, structured-headers, ethers, plus core/'s nested hbsig copies) get replaced with `Buffer.from(s, "base64")`. This unblocks the workerd-strict atob errors.

With patches applied, mkdir / set / get now reach the **auth phase** and fail with `"operation not allowed"`. This is a separate auth-installation issue: `init_query.auth` (the `dirs_set` rule) is supplied as `query[0]` to the init pipeline, but `dev_init.js` only reads `query[0].branch` and `query[0].version` — it doesn't install the user-supplied auth rules. Either `dev_init` needs to honor those, or there's a follow-up call in hb's existing flow that wires them up that we haven't replicated.

Same `init_query` works in `hb/test/db-bare.js`, so the existing flow handles this somehow. Worth investigating: is there an extra `["set:auth", ...]` call in hb's flow we're missing?

## What's stubbed

`HBClient.sendBundle` (`src/hb-client.js`) — needs a signed AO DataItem POSTed to HyperBEAM. The alarm machinery and recovery work; only the actual transmission to HB is missing. Belongs to its own PR alongside the atob fix.

## Coexistence with the Node rollup

This Worker is a parallel implementation of `hb/src/server.js`. Both serve the same client-facing API. Choice at deploy time:

| Deployment | Command | When |
|---|---|---|
| Cloudflare (default) | `yarn rollup-cf` (added in PR 4) | Most users; no Erlang/HyperBEAM submodule required for the rollup process. |
| Node + LMDB (existing) | `yarn rollup` | Users running their own HyperBEAM stack who want full local control. |

Validator, SU, CU, Bundler, ZK Prover are unchanged; they continue to talk to HyperBEAM directly. Moving the rollup does not affect them.

## Local development

```bash
cd cf
npm install
wrangler dev   # boots Worker + local DO at http://localhost:8787
```

Point a local HyperBEAM at port 10001 (`yarn hyperbeam` from the repo root) and override `HB_URL`:

```bash
wrangler dev --var HB_URL:http://localhost:10001
```

## Testing

```bash
cd cf
npm install
npm test       # node:test runs cf/test/*.test.js
```

PR 1 tests are pure-JS unit tests against a mock `DurableObjectStorage` — no Miniflare or wrangler runtime required. PR 2 onward will add Miniflare-driven integration tests.

## No regression on existing code

PR 1–3 only add files under `cf/`. No file in `core/`, `hb/`, `sdk/`, or `scripts/` is modified. Existing test suites (`cd hb && npm test`, `cd rollup && cargo test`) are unaffected.

## Architecture snapshot (post-PR 3)

```
Client
  │ signed HTTPS
  ▼
Worker (src/worker.js)              GET /status
  │                                 GET /~weavedb@1.0/get   ┐
  │ env.PROCESS_DO.idFromName(pid)  POST /~weavedb@1.0/set ─┤ → forward to DO
  ▼
ProcessDO per pid (src/process-do.js)
  ├── ensureDB() — lazy: hydrate DOIo, dyn-import wdb-core, run recover()
  ├── handleSet — verify sig, init/admin gate, run pipeline, fire validator spawn
  ├── handleGet — read query → db[op](args)
  └── alarm()    — walFlush() + rescheduleWalAlarm()
       │
       ├── wal-do.js#walFlush         reads __wal__/<h>, sends to HB, bumps height
       ├── recover-do.js#recover      pages getMsgs from HB, replays missed
       └── hb-client.js#HBClient      getMsgs ✓ | sendBundle ✗ (PR 4)
            │ outbound HTTPS
            ▼
       https://hb.wdb.ae:10002 → HyperBEAM :10001
```

Validator/SU/CU/Bundler/ZKP are unchanged Node processes — they continue to talk directly to HyperBEAM.
