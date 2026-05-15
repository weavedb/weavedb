# CF-native rollup plan

A Cloudflare-only deployment that keeps the WAL → bundle → ZK pipeline
end-to-end inside CF infrastructure, with no commit path to HyperBEAM.
Replaces the missing `HBClient.sendBundle` step in `cf/src/hb-client.js`
with an R2-backed archive plus a sidecar prover.

## Goals

- **No HB write path.** The CF deployment is self-contained; HB stays
  optional (read-only source for migration / mirroring).
- **Durable, ordered bundle log per pid** that anyone can replay.
- **ZK proofs preserved.** Available on demand, no per-write CPU spike
  inside Workers.
- **Same SDK surface** so clients don't care which target is running
  (`/~weavedb@1.0/get|set|admin`).

## Non-goals

- On-chain L1 anchor (covered as a thin optional addition at the end).
- Hot-swapping between HB-source and R2-source mid-flight (cold migration
  only).

## Storage layout

| Concern                            | CF resource             | Notes |
|------------------------------------|-------------------------|-------|
| Live WAL (recent slots, hot R/W)   | Durable Object SQLite   | Already the model in `cf/src/process-do.js`. One DO per pid. |
| Archived bundles (immutable, by slot) | R2                   | `bundles/<pid>/<slot>.bin` — `{zkhash, buf, ts}`. |
| Bundle index / pid registry        | DO storage (worker DO)  | `pid → {head_slot, last_archived_slot}`. |
| ZK tree (SMT cols/nodes)           | DO SQLite + R2 snapshot | Live in DO; periodic snapshot to R2 for fast cold-start of a fresh validator. |
| ZK proofs (per slot / per query)   | R2                      | `proofs/<pid>/<slot>.json`. Written by the prover, served by the Worker. |

## Pipeline (replaces the HB commit path)

1. **Set** — DO receives the signed request, runs the existing
   `normalize → verify → parse → auth → write` pipeline (already wired
   in `cf/src/process-do.js`). Append to local WAL table
   (`__wal__/<slot>`).
2. **Bundle** (DO alarm, every `N` slots or `M` seconds): drain pending
   WAL entries, build the same arjson-compressed bundle using
   `buildBundle` semantics from `hb/src/validate.js` (deterministic
   already), compute `zkhash` over the SMT delta.
3. **Archive** — write `{zkhash, buf}` to R2 at
   `bundles/<pid>/<slot>.bin`. Update the DO bundle index. **This is
   the "commit"** — replaces `sendBundle` to HB.
4. **ZK proof gen** — deferred; see the next section.

## ZK proof generation — client-side proving

The server is responsible for *inputs*, the client is responsible for
the *proof*. This keeps groth16 + snarkjs + the multi-MB zkey
completely off the Worker hot path and out of any sidecar.

### Why client-side

- Workers can't host groth16 / snarkjs in-line (CPU and memory bounds
  + tens of MB of zkey + seconds per proof).
- A sidecar prover doubles the deployment surface (Container or VM).
- Privacy is better — the client's `path` / `query` / target doc
  never has to leave the SDK.
- Scales infinitely. Proof cost is paid by the requester.
- The circuit's wasm + zkey are static assets — cacheable in the
  browser, fetched once.

### Server side (Worker + DO)

Worker exposes `/~weavedb@1.0/zkp-inputs` (or `GET /zkp/<pid>?dir=&doc=&path=&query=`):

1. Read the live SMT for the requested `pid` out of DO storage
   (cols, siblings, current root). For deep history, fall back to the
   most recent SMT snapshot in R2 plus a replay of subsequent bundles.
2. Compute the inputs the circuit needs — exactly what
   `zkjson`'s `DB.getInputs({json, col_id, id, path, val, query})`
   returns today: `{json, path, val, key, col_key, root, col_root,
   siblings, col_siblings}` plus the public root.
3. Return inputs as JSON, including the bundle's `zkhash` and a
   versioned circuit hint (`{circuit: "db2", params: {...}}`) so the
   client knows which wasm/zkey to load.

A single `dev_get_zkp_inputs.js`-style pipeline already exists in
`core/src/` — the CF version is the same thing wrapped behind a Worker
route. No new SMT logic required.

### Client side (SDK)

`wdb-sdk` gains a thin prover:

```js
const inputs = await db.zkpInputs({ dir, doc, path, query })
const proof = await Prover.fromCircuit("db2").genProof(inputs)
// proof can now be POSTed to a Solidity verifier, or kept locally.
```

- `Prover` loads `index.wasm` and `index_0001.zkey` once (lazy,
  cached) from a CDN — same artifacts that today sit at
  `hb/src/circom/db2/`. We publish them as static assets next to the
  SDK.
- `genProof` is a wrapper around `groth16.fullProve` that already
  works in browsers via snarkjs' UMD build.
- The same prover works in Node (CLI / scripts) without any change.

### What's stored where

| Artifact                  | Where                                    |
|---------------------------|------------------------------------------|
| Bundle bytes (per slot)   | R2 — `bundles/<pid>/<slot>.bin`          |
| SMT (live)                | DO SQLite                                |
| SMT snapshot (cold-start) | R2 — `smt/<pid>/<slot>.snap`             |
| Proof inputs              | Computed on demand from DO + R2, not stored |
| Generated proof           | Client memory, or wherever the caller wants it (no server-side caching needed) |
| Circuit wasm + zkey       | Static CDN-cached SDK asset, fetched once per client session |

## Replay / validator

The bundle stream at R2 `bundles/<pid>/*.bin` is ordered by slot. Anyone
running a validator:

1. Walks R2 in order from `from_slot` to `head_slot`.
2. Replays each delta into a local SMT.
3. Compares the resulting root against the latest bundle's `zkhash`.

No HB needed. The Worker can also expose `/replay?from=N` to stream
bundles directly to a thin client.

Because proving is client-side, a validator does *not* need any prover
state — it just needs the bundle log + bundle index. Anyone with the
public R2 URL can verify the chain.

## Optional: on-chain anchor

Periodic CF cron → Worker:

1. Reads `head_slot`'s `zkhash` from the DO bundle index.
2. Submits the `zkhash` (Merkle root) to Ethereum (or Arweave) via a
   Worker-callable signer. **No proof needed at anchor time** — the
   on-chain contract just stores the root; ZK verification happens
   later when a client wants to prove a specific value against that
   root (client generates the proof, then submits it to the same
   verifier contract).

The only piece in this design that needs a key in `env`. Skip if you
don't need an L1 commitment.

## Optional: hybrid permanence (CF + Arweave)

For apps that want CF's hot-path economics but also want Arweave-grade
permanence for the historical log, run a low-frequency uploader:

1. CF cron (e.g. every `K` minutes) → Worker.
2. Worker lists finalized bundles in R2 that haven't been uploaded yet.
3. For each one, POST the bytes to a Turbo / standalone bundler with a
   signed `Content-Type: application/octet-stream` tag.
4. Store the resulting Arweave tx id back in the DO bundle index
   alongside the R2 key.

Because we're shipping *finalized bundles* (not per-write), costs are
~1-2 orders of magnitude lower than the current HB write-every-time
path. You get the cheap CF read path **and** permanent off-CF storage.

If you also do the on-chain anchor, the chain points at the Arweave tx
ids, so the log survives a CF outage by definition.

## Privacy posture

A key reason to prefer the CF path: data is **private by default**.

### Arweave-native (current hb path)

- Every WAL bundle is published to Arweave. Public, permanent, no
  takedown.
- Even encrypted data leaks ciphertext + existence + size + write
  timing + signer — and forever.
- ZK proofs help *verify* without revealing the value to the verifier,
  but the underlying bundle is still on-chain. Anyone can build a
  public index of "pid `<x>` had a write at slot `<n>` of size `<s>`
  signed by `<addr>`."

### CF-native

- Bundles live in R2 behind the Worker. Access control is yours, same
  as any cloud DB.
- DO state is fully private; only the Worker fronts it.
- **Client-side proving** means `path`, `query`, target `doc`, and
  `val` never leave the SDK. The Worker hands the client raw circuit
  inputs (SMT siblings + the doc bytes); the proof comes back fully
  formed. The Worker can be made completely blind to what the client
  is actually proving.
- You publish only `zkhash` (Merkle root) for anchoring; everything
  else stays private. Selective disclosure: a client can prove "I have
  a doc where property `X = Y`" without anyone else seeing the rest of
  the doc.

### Privacy modes by deployment

| Mode | What's public | What stays private |
|---|---|---|
| **CF default** | DO + R2 gated by Worker auth | Everything except `zkhash` (if anchored) |
| **CF + public verifier** | R2 bundles readable openly | Client queries / paths still private |
| **CF + Arweave anchor** | Arweave gets the `zkhash` chain only | Bundle contents stay in R2 |
| **CF + Arweave permanence (hybrid)** | Encrypted bundles on Arweave + roots on chain | Plaintext if encrypted in-bundle |
| **Arweave-native (hb)** | Everything is public-permanent | Nothing — encrypted data still leaks metadata |

For privacy-sensitive apps (medical, legal, identity, internal company
data, B2B), the CF path is the right default. The Arweave-native path
fits when "anyone, ever, must be able to verify this end-to-end" is a
hard product requirement.

## Concrete code shape

```
cf/src/
├── worker.js              existing — add /zkp-inputs and /replay routes
├── process-do.js          existing — extend alarm with bundle()+archive()
├── wal-do.js              existing — on flush, call R2 archive
├── recover-do.js          existing — extend to read from R2 + DO state
├── r2-archive.js          NEW — archiveBundle, readBundle, listBundles
├── zkp-inputs.js          NEW — computes circuit inputs from DO SMT + bundles
└── hb-client.js           keep getMsgs (still useful for HB-source mode); drop sendBundle stub

sdk/src/
└── prover.js              NEW — thin browser/Node wrapper around groth16.fullProve
                                  (loads wasm + zkey lazily, caches)
```

## Tests (mirroring the existing miniflare setup in `cf/test/`)

- `cf/test/r2-archive.test.js` — Miniflare `R2Bucket` binding.
- `cf/test/process-do-bundle.test.js` — extend existing DO tests with
  bundle + archive after alarm.
- `cf/test/zkp-inputs.test.js` — assert the Worker returns the exact
  inputs `groth16.fullProve` expects (compare against a fixture
  generated from the existing Node prover).
- `cf/test/replay.test.js` — full pipeline: write → bundle → archive to
  R2 → fresh validator replays → matches root.
- `sdk/test/prover.test.js` — round-trip: inputs from a stub server →
  `Prover.genProof` → verify locally against the verification key.

## Migration / coexistence with the Node/Express path

- Same `/~weavedb@1.0/{get,set,admin}` surface, so SDKs and clients
  don't change.
- `cf/` can recover from an HB-backed pid (`HBClient.getMsgs`) once at
  startup, then run R2-only afterward.
- The Node/Express rollup (`hb/src/server.js`) keeps the HB-anchored
  flow for deployments that need it. The two are independent processes
  on the same `wdb-core`.

## What ends up in the zk tree today

Worth being precise here: the `filter(v => v.name[0] !== "_")` at
`core/src/dev_decode.js:131` operates on the **dirs list for downstream
collection-creation work**, not on the `zkdb.insert` call (which runs
earlier at line 95 for every change). So the tree's actual contents
are governed by the SMT's own size limits + the surrounding try/catch,
not by an explicit underscore-prefix filter on the insert.

Concretely, per `dev_init.js` + ongoing writes:

| Path                          | What                          | In tree? |
|-------------------------------|-------------------------------|----------|
| `_` / `_config`               | dirinfo metadata              | ❌ `cols["_"]` never set → insert throws, catch eats |
| `_config` / `info`            | DB info (owner, last_dir_id)  | ✅ small, fits `size_json=256` |
| `_config` / `auth_<dir>_<i>`  | fpjson auth rule              | ✅ small, fits |
| `_config` / `schema_<dir>`    | JSON schema                   | ⚠️ in tree if small, silently dropped if it overflows (e.g. a wrapper around draft_07) |
| `_config` / `indexes_<dir>`   | index definitions             | ✅ small, fits |
| `<dir>` / `<docid>`           | user document                 | ✅ subject to `size_json=256` |

### What this means for "provable database logic"

Because **fpjson auth rules are in the tree**, a client can already
prove "auth rule `R` was in force when slot `N` mutated doc `D`."
Similarly for DB info and index definitions. The pipeline's
declarative logic (which is fpjson, not opaque code) is committed.

The only gap is **large data schemas**. When a JSON schema overflows
`size_json=256` (the SDK's nested-poseidon ceiling), the SMT throws
and the catch drops it on the floor. Everything else about the
pipeline state is still attestable from the bundle's `zkhash`.

Two ways to close the schema gap when needed:

1. **Hash-of-schema in tree.** Store `poseidon(canonicalize(schema))`
   at `_config/schema_<dir>` instead of the full bytes. Reveal the
   schema off-tree (R2) when a verifier asks. No SMT size pressure,
   schemas can be arbitrarily large. Cheap to add; no circuit change.
2. **Bigger circuit family for config.** Generate `db-cfg` with
   larger `size_json` + the nested-poseidon SMT chunking that doesn't
   exist upstream yet. Runs alongside the main `db2` data tree as a
   second SMT with its own root. Lets the schema bytes themselves be
   in-circuit. Heavy; only worth it if you need ZK-verifiable schema
   conformance proofs, not just identity.

Either is an additive change to the existing pipeline; not in scope
for the initial CF deployment but worth flagging as the natural
follow-on.

## Open questions

1. **Circuit asset hosting.** Where do `index.wasm` and
   `index_0001.zkey` live for the SDK to fetch? Defaults: publish them
   as part of `wdb-sdk` npm package (~70 MB) or host on a CDN URL the
   SDK fetches lazily. Latter is cheaper for users who don't use ZK.
2. **R2 lifecycle / cost.** Bundles are forever by default; do we want
   a TTL or a tiered move to cold storage after `K` months?
3. **SMT snapshot cadence.** Every bundle (cheap reads but storage
   spike), every `K` bundles (cheaper R2, slower cold-start), or never
   (replay-only)? Default: every 100 bundles.
4. **Auth on `/zkp-inputs` and `/replay`.** Open by default?
   Operator-only? Same access rules as `/~weavedb@1.0/admin`?

## Build order (PRs)

1. `r2-archive.js` + `cf/test/r2-archive.test.js` — concrete, isolated.
2. `process-do.js` alarm extension to call archive + index update.
3. `zkp-inputs.js` + Worker route — port `core/src/dev_get_zkp_inputs.js`
   semantics to the DO + R2 environment.
4. `wdb-sdk` `Prover` wrapper + `sdk/test/prover.test.js` (uses fixed
   inputs from PR 3 as the cross-validation point).
5. `/replay` Worker route.
6. Replace `hb-client.sendBundle` stub with a "disabled / archive
   instead" path.
7. Optional: on-chain anchor cron.

Each PR is self-contained and reversible — `cf/` can ship to staging at
any step in this list.
