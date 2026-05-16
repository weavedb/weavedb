# weavedb-cf — Cloudflare-native WeaveDB rollup

A WeaveDB rollup that runs entirely on Cloudflare Workers + Durable
Objects + R2. No HyperBEAM required.

Same SDK surface as the Node/Express rollup at `hb/src/server.js`, so
clients don't need to know which one is running:

```
POST /~weavedb@1.0/set          signed writes
GET  /~weavedb@1.0/get          reads
GET  /~weavedb@1.0/zkp-inputs   inputs for client-side proof generation
GET  /~weavedb@1.0/replay       NDJSON bundle stream
GET  /~scheduler@1.0/schedule   HB-shape getMsgs (so hb/src/validate.js
                                works against this Worker unchanged)
GET  /status                    node info
scheduled()                     periodic anchor cron (optional)
```

## Architecture in one breath

```
client → Worker → DO (per pid)
                  │   ├── WAL  (state.storage)
                  │   └── alarm
                  │       └── serializeBundle → R2: bundles/<pid>/<slot>.bin
                  │           with zkhash = sha256(buf)
                  │
                  └── on cold start, recover() replays from R2 (and/or HB)
```

Each pid is one Durable Object. The DO owns the live WAL; finalized
bundles get archived to R2 by the alarm. Recovery walks R2 back into
DO state. A separate validator can subscribe via
`/~scheduler@1.0/schedule` and produce SMT-anchored bundles using
the existing `hb/src/validate.js` pipeline — that's full parity with
the HB-anchored mode.

For the full design rationale, deployment trade-offs, and privacy
posture, see `plan-cf.md` at the repo root.

## Quickstart (deploy from scratch)

Prereqs: a Cloudflare account with Workers Paid (for DO + R2), and
the `wrangler` CLI installed.

```bash
cd cf
npm install

# 1. Create the R2 bucket the alarm archives into.
wrangler r2 bucket create weavedb-bundles

# 2. Provision your operator JWK (used for admin gating + signing).
#    Generate one with:
#      node -e 'require("arweave").wallets.generate().then(j=>console.log(JSON.stringify(j)))'
#    or reuse an existing Arweave key.
wrangler secret put JWK   # paste the JWK JSON when prompted

# 3. Deploy.
wrangler deploy
```

That gives you a fully working CF-only rollup at
`https://weavedb-rollup.<your-subdomain>.workers.dev`. The default
config in `wrangler.toml` is CF-native (no `HB_URL`, no
`ANCHOR_URL`). The hourly anchor cron is on but in dry-run.

## Run locally

```bash
cd cf
npm install
wrangler dev
```

Wrangler boots `workerd` with miniflare-backed DO + R2 bindings. The
integration tests at `cf/test/miniflare*.test.js` use the same
machinery, so anything that runs there also runs locally.

## Deployment modes

Pick the mode by which env bindings you set in `wrangler.toml`.

### CF-native (default)

- `BUNDLES` R2 binding: required (write target).
- `HB_URL`: not set.
- `ANCHOR_URL`: optional. Empty = dry-run anchor cron.

Writes → DO → R2. No HyperBEAM dependency. This is the recommended
default for new deployments.

### CF + Arweave permanence (hybrid)

- `BUNDLES` binding (hot path).
- `ANCHOR_URL` set to an Arweave-anchor webhook.

CF still owns the hot read/write path; the cron periodically commits
the head zkhash to Arweave for permanence. ~1–2 orders of magnitude
cheaper than per-write-to-Arweave because you bundle many writes
into one finalized bundle before anchoring. See plan-cf.md's
"Optional: hybrid permanence" section.

### CF + HB recovery source

- `BUNDLES` binding + `HB_URL` set.

Writes still go to R2 in the alarm; recovery additionally pulls from
HB. Useful for migration: bring your HB-anchored pid up on CF, then
drop HB once you're sure recovery never needs it again.

### HB-only (legacy)

If you really need HB-only, run the Node/Express rollup at
`hb/src/server.js` instead. The CF deployment requires `BUNDLES` to
be functional — without it the WAL has nowhere to flush.

## Anchoring zkhashes to L1

The anchor cron POSTs `{pid, slot, zkhash, ts}` to your `ANCHOR_URL`
webhook. The webhook is responsible for signing and submitting to
Ethereum / Arweave / whatever — no L1-specific signing lives in the
Worker, which keeps the Worker bundle small and chain-agnostic.

A minimal Node anchor service might look like:

```js
import express from "express"
import { ethers } from "ethers"

const app = express()
app.use(express.json())
app.post("/", async (req, res) => {
  const { pid, slot, zkhash } = req.body
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  const contract = new ethers.Contract(addr, abi, wallet)
  const tx = await contract.commitRoot(pid, slot, zkhash)
  res.json({ ok: true, tx: tx.hash })
})
app.listen(3000)
```

Or skip the anchor entirely — most CF-native deployments don't need
on-chain commitment unless they expose value-bearing data.

## Client-side proving

The SDK `wdb-sdk` ships `Prover` + `fetchZkpInputs`:

```js
import { Prover, fetchZkpInputs } from "wdb-sdk"

// Server returns encoded circuit inputs from R2 + DO state.
const res = await fetchZkpInputs({
  url: "https://weavedb-rollup.example.workers.dev",
  pid,
  dir: "users",
  doc: "alice",
  path: "name",
})

// Fill SMT siblings from your validator/oracle if meta.complete is false.

const prover = new Prover({
  wasm: "/circuits/db2/index_js/index.wasm",
  zkey: "/circuits/db2/index_0001.zkey",
})
const proof = await prover.genProof(res.inputs)
// proof is a 14-element zkjson tuple, ready for a Solidity verifier.
```

snarkjs runs in browsers and Node alike; the wasm + zkey are static
assets you serve from your own CDN.

## Sidecar validator (for client-side proving)

If you want clients to generate zk proofs, you need a validator that
maintains the live SMT and serves protocol-complete `/zkp-inputs` —
the Worker itself can't host the SMT because workerd blocks dynamic
`WebAssembly.compile`, which zkjson's Poseidon needs. (See plan-cf.md
"SMT placement in the CF deployment".)

The sidecar is just a Node process running `hb/src/zkp.js` pointed at
the CF Worker's `/~scheduler@1.0/schedule` (PR 8 of plan-cf.md). It
walks the WAL, replays through the wdb-core pipeline, maintains the
SMT under `__zkp__/*`, and serves `/~weavedb@1.0/zkp-inputs` over HTTP.

Start it like this (any host with Node, doesn't have to be a CF
Container):

```bash
cd hb
node -e '
  import("./src/zkp.js").then(({default: zkp}) => zkp({
    dbpath: "/var/lib/weavedb/zkp",
    hb: "https://weavedb-rollup.example.workers.dev", // your CF Worker
    port: 6365,
    jwk: JSON.parse(process.env.JWK),
  }).then(srv => {
    process.on("SIGTERM", () => srv.close())
  }))
' &
```

Then point the Worker at it via `VALIDATOR_URL` in `wrangler.toml`:

```toml
[vars]
VALIDATOR_URL = "https://prover.example.com:6365"
```

Redeploy. Now SDK clients hitting `/~weavedb@1.0/zkp-inputs` on the
Worker get fully-formed inputs back (siblings + roots populated), and
`Prover.genProof(inputs)` runs end-to-end in the browser or Node
client. Without `VALIDATOR_URL` the Worker returns partial inputs
(json/path/val signals only) — fine for offline encoding tests, not
for actual proving.

The sidecar is **stateless beyond its local SMT** — anyone running
the same protocol code against the same WAL converges. You can run
several in parallel for redundancy, or none if you don't need proofs.

## Validators (HB-parity mode)

The Worker exposes R2 bundles in HB's native getMsgs format at
`GET /~scheduler@1.0/schedule?target=<pid>&from=&to=`. That means
`hb/src/validate.js` works against the CF Worker with **zero code
changes** — just point its `HB_URL` config at the Worker URL.

The validator's `commit()` produces SMT-derived `zkhash` bundles via
`buildBundle()`, matching exactly what HB-anchored deployments produce.

## Tests

```bash
cd cf
npm test                   # 194 unit + handler tests
npm run test:integration   # 2 miniflare-backed end-to-end suites
```

All in-process tests run against `MockR2Bucket` and `MockStorage`;
miniflare exercises the real workerd runtime so workerd-incompat
issues surface before deploy.

## Where things live

```
cf/
├── src/
│   ├── worker.js                  router + scheduled() anchor cron
│   ├── process-do.js              per-pid Durable Object
│   ├── do-kv.js                   sync KV adapter over async DO storage
│   ├── wal-do.js                  WAL alarm, serializeBundle, contentHash
│   ├── r2-archive.js              R2 read/write/list of archived bundles
│   ├── zkp-inputs.js              circuit input encoder (server side of client-proving)
│   ├── recover-do.js              cold-start replay from HB and/or R2
│   ├── anchor.js                  L1 anchor cron logic
│   ├── hb-scheduler-compat.js     /~scheduler@1.0/schedule for HB validators
│   ├── hb-client.js               read-only HB client (recovery only)
│   ├── db-main.js                 Workers-only wdb-core route subset
│   ├── auth.js                    signed-request verification
│   └── atob-polyfill.js           workerd-compat atob shim
└── test/                          mirrors src/ one-to-one
```

## Coexistence with hb/

`cf/` and `hb/src/server.js` are independent deployment targets that
share `wdb-core`. Same `/~weavedb@1.0/*` route surface; pick based on
operational fit:

| | `cf/` | `hb/` |
|---|---|---|
| Where | Cloudflare edge | Self-hosted Node |
| Storage | R2 + DO SQLite | LMDB |
| Anchor | Webhook to your chain | Arweave via aoconnect/Turbo |
| Setup | wrangler deploy | Erlang + rebar3 + HyperBEAM submodule |
| Cost shape | Pay-per-request + R2 storage | Per-write Arweave fee (one-time, permanent) |
| Best for | Most apps | "Anyone, ever, can verify this on-chain" requirements |
