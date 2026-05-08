# WeaveDB Infrastructure

Two deployment modes share most of the stack; only the **rollup** component differs.

| Component | Node mode (existing) | Cloudflare mode (`cf/`) |
| --- | --- | --- |
| Rollup HTTP server | `hb/src/server.js` (Express, port 6364) | Worker + Durable Object (`cf/src/`) |
| Per-pid state | LMDB at `.db/<pid>` | DO storage (SQLite-backed) |
| Everything else | unchanged across modes | unchanged across modes |

Sections 1–12 below describe the full HyperBEAM stack that **both modes** depend on. The "Local processes" table marks which processes are Node-only vs deployment-mode-agnostic. See `docs/docs/pages/ops/cloudflare.mdx` for CF-specific deployment.

---

## 1. Local processes (7)

Seven long-running services. Each is launched by a top-level npm script wrapping an entry in `hb/src/`.

| # | Service | Port | Entry | Launch | Owns |
|---|---|---|---|---|---|
| 1 | HyperBEAM | 10001 | `HyperBEAM/` (Erlang/rebar3) | `npm run hyperbeam` (`./hyperbeam.sh`) | Consensus + ordering. Assigns slot numbers. |
| 2 | Rollup | 6364 | `hb/src/server.js` | `npm run rollup` | User-facing HTTP API. LMDB read path. WAL → HyperBEAM. |
| 3 | SU (Sequencer) | 4003 | `hb/src/su.js` | `npm run su` | Bridges HyperBEAM → Bundler → AO testnet MU. |
| 4 | CU (Compute Unit) | 6366 | `hb/src/cu.js` | `yarn cu --wallet ./HyperBEAM/.wallet.json --pid <pid>` | On-demand ZK proof generator. |
| 5 | Bundler | 4001 | `hb/src/bundler.js` | `npm run bundler` | Uploads DataItems to Arweave via Turbo. |
| 6 | Validator | 6367 | `hb/src/validator.js` | `yarn validator --wallet ./HyperBEAM/.wallet.json --pid <pid>` | Per-DB AO process replicas. Builds ZK Merkle commitments. |
| 7 | ZK Prover | 6365 | `hb/src/zkjson.js` | `npm run zkp -- --vid <vid>` | Groth16 prover. Optional `commitRoot` onchain. |

Bring-up dependency order: HyperBEAM → Rollup → SU → CU → Bundler → Validator → ZK Prover.

## 2. Build-time dependencies

Without these installed, the integration won't compile or start.

| Tool | Min version | Used by | Notes |
|---|---|---|---|
| Node.js | `>=22.5.0 <23` | All JS services | Strict pin in `hb/package.json:26`. Tests need `--experimental-sqlite --experimental-wasm-memory64`. |
| Erlang/OTP | OTP-26+ (matches HyperBEAM target) | HyperBEAM | Required to run BEAM. |
| rebar3 | latest | HyperBEAM | `rebar3 compile`, `rebar3 as weavedb shell`. |
| gcc-12 / g++-12 | 12+ | HyperBEAM native deps | Hardcoded in `hb/package.json:20-22` and `hyperbeam.sh:79-83`. On newer GCC (15+) the HyperBEAM C sources fail with `-Wincompatible-pointer-types` / `-Wpointer-sign` errors; export `CFLAGS="-Wno-error=incompatible-pointer-types -Wno-error=pointer-sign"` before `rebar3 compile` to build with stock GCC. |
| CMake | with `CMAKE_POLICY_VERSION_MINIMUM=3.5` | HyperBEAM native deps | Set via `.env.hyperbeam`. |
| Rust toolchain | latest stable | `rollup/` (prototype only) | Not required for HyperBEAM-mode production; only for the Rust prototype. |
| Foundry / Hardhat | latest | `solidity/` | Required only when (re)deploying the onchain verifiers. |

## 3. Git submodule

| Path | URL | Branch | Notes |
|---|---|---|---|
| `HyperBEAM/` | `https://github.com/weavedb/HyperBEAM.git` | `weavedb` | Empty by default. `git submodule update --init --recursive` is **required** before `npm run hyperbeam` will work. |

## 4. Secrets / keys

| Artifact | Path | Used by |
|---|---|---|
| Arweave JWK (signing key) | `HyperBEAM/.wallet.json` | All services that sign DataItems (HyperBEAM, Rollup, SU, Validator, ZK Prover, Bundler). Read by `scripts/run-*.js`. |
| Service-specific wallets (optional) | `scripts/.wallets/` | Per-script overrides. |
| Ethereum private key | passed via `--priv_key` to `run-zk-prover.js` | ZK Prover, only when `--commit` is set (writes `commitRoot` onchain). |
| Alchemy API key | `--alchemy_key` to `run-zk-prover.js` | ZK Prover, RPC for Sepolia. |

## 5. Trusted-setup artifacts (Groth16)

Required for any ZK proof generation. Pre-compiled per circuit, distributed with the `zkjson` npm package or built locally.

| Path | Contents | Used by |
|---|---|---|
| `hb/src/circom/db/index_js/index.wasm` | DB query circuit | ZK Prover, Validator |
| `hb/src/circom/db/index_0001.zkey` | DB proving key | ZK Prover |
| `hb/src/circom/ipfs/index_js/index.wasm` | IPFS/NFT proof circuit | NFT proofs |
| `hb/src/circom/ipfs/index_0001.zkey` | IPFS proving key | NFT proofs |

Not vendored in this repo's git tree — must be present at runtime.

## 6. External services

| Endpoint | Purpose | Caller | Source |
|---|---|---|---|
| `mu.ao-testnet.xyz` | AO message unit (off-chain index) | SU | `su.js:200-208` |
| `up.arweave.net` (Turbo) | Permanent Arweave bundling | Bundler | `bundler-utils.js:52` |
| `eth-sepolia.g.alchemy.com` | EVM `commitRoot` of ZK roots | ZK Prover | `zkjson.js:390-407` |
| HuggingFace registry | Default embedding model (Vec paradigm only) | Vec server | `kv_vec.js:9` |

The Solidity verifiers (`ZKDB.sol`, `NORU.sol`, `VerifierDB.sol`) are deployed per environment; ZK Prover takes the contract address via `--commit <addr>`.

## 7. On-disk state (gitignored)

| Path | Contents | Owner |
|---|---|---|
| `.db/` | Rollup LMDB | Rollup, SU, Bundler (default `--dbpath`) |
| `.db/validator/` | Validator LMDB (state replicas, ZK tree, `__wslot__`, `__cslot__`) | Validator, CU |
| `.db/zk/` | ZK prover cache | ZK Prover |
| `.weavedb/` | Misc runtime state | Tools |
| `.env.hyperbeam` | Compiler env (`CC`, `CXX`, `CFLAGS`, `CMAKE_POLICY_VERSION_MINIMUM`, `CWD`) | `hyperbeam.sh:44-49`; `wao` reads it via `dotenv.config({ path: ".env.hyperbeam" })` from the test's cwd, so to run HyperBEAM-spawning tests from `hb/` you also need a copy at `hb/.env.hyperbeam` with `CWD=../HyperBEAM`. Both files are gitignored. |
| `zkp.json` | ZK prover config | ZK Prover |
| `logs/`, `*.log` | Runtime logs | All |

## 8. NPM packages (team-published, runtime deps)

External team packages required for the integration to function. All resolved from npm registry.

> **Local-source caveat for `wdb-core`.** The repo's `core/` directory is what gets published as `wdb-core`, but `hb/package.json` depends on `wdb-core` from npm — so changes to `core/src/*` don't reach `hb/src/*` (server, validator, cu, zkp, server-sql, server-vec) until the package is republished. While iterating locally, mirror edits with `cp core/src/dev_*.js hb/node_modules/wdb-core/esm/`. The proper fix is a workspace / `file:../core` setup, but that's a packaging change beyond this snapshot.


| Package | Role | Used by |
|---|---|---|
| `zkjson` (^0.8.4) | SMT + Groth16 proof system; `ZKDB`, `NFT`, `Prover` classes; ships Solidity base contracts | core, hb |
| `fpjson-lang` (^0.1.6) | Auth-rule and trigger language interpreter | core, hb |
| `arjson` (^0.1.3) | Bit-packed JSON delta encoding for state bundles | core, hb |
| `hbsig` | RFC 9421 HTTP message signature signing/verification + address derivation | core, sdk, hb |
| `wao` (^0.37.7) | AO/Arweave abstraction (`hb.message`, `hb.compute`, `hb.send104`, `hb.getMsgs`) + test mock (`HyperBEAM`, `acc`) | sdk, hb, scripts |
| `@permaweb/aoconnect` | AO RPC primitives | hb |
| `arweave` | Arweave RPC + JWK utilities | hb |
| `ethers` | Ethereum RPC for `commitRoot` | hb (zkp) |
| `lmdb` | Persistent KV | hb |
| `@lancedb/lancedb` | Vector storage (Vec paradigm only) | core |

## 9. Onchain artifacts

Required only if the ZK Prover's `--commit` mode is enabled.

| Contract | Source | Purpose | Inherits from |
|---|---|---|---|
| `VerifierDB.sol` | `solidity/contracts/` | Auto-generated Groth16 pairing verifier | `Groth16VerifierDB` (in `zkjson` npm pkg) |
| `ZKDB.sol` | `solidity/contracts/` | Optimistic-rollup query interface (`qInt`, `qFloat`, `qString`, etc.) | `OPRollup` (in `zkjson`) |
| `NORU.sol` | `solidity/contracts/` | Non-optimistic-rollup variant (path proven inside ZK proof) | `NORollup` (in `zkjson`) |

Deployed via `solidity/scripts/deploy.js` / `deploy_noru.js`. No `hardhat.config.*` in this repo — chain configured at deploy time. Default ZK Prover RPC is Sepolia.

## 10. Network ports (summary)

| Port | Service | Protocol | Bound by default? |
|---|---|---|---|
| 10001 | HyperBEAM | HTTP | Yes (`hyperbeam.sh:72,214`) |
| 6364 | Rollup | HTTP | Yes (`run-rollup.js:6`) |
| 4003 | SU | HTTP | Yes (`run-su.js:9`) |
| 4001 | Bundler | HTTP | Yes (`run-bundler.js:9`) |
| 6367 | Validator | HTTP | Yes (`run-validator.js:10`) |
| 6365 | ZK Prover | HTTP | Yes (`run-zk-prover.js:10`) |
| 6366 | CU | HTTP | Yes (per docs.weavedb.dev/ops/cu) |
| 10002 / 10003 / 10004 | NGINX-proxied HTTPS variants | TLS | Production only; see `docs/docs/pages/ops/remote-servers.mdx` |

## 11. CLI flag surface (per service)

Documented in each `scripts/run-*.js`:

- `run-rollup.js`: `--port`, `--hb`, `--db`, `--wallet`
- `run-bundler.js`: `--port`, `--wallet`, `--dbpath`, `--mock`
- `run-su.js`: `--port`, `--hb`, `--db`, `--mu`, `--wallet`, `--bundler`, `--dbpath`
- `run-cu.js`: `--hb`, `--wallet`, `--db`, `--pid` (required)
- `run-validator.js`: `--port`, `--hb`, `--wallet`, `--db`
- `run-zk-prover.js`: `--port`, `--hb`, `--vid`, `--cid`, `--config`, `--db`, `--commit`, `--alchemy_key`, `--priv_key`

## 12. Production-extras (NGINX, certbot)

For internet-exposed deployments, the NGINX + Let's Encrypt setup in `docs/docs/pages/ops/remote-servers.mdx` adds:

- Reverse proxy fronting HyperBEAM (10002 → 10001), Rollup (10003 → 6364), and other services
- TLS via certbot
- Per-domain isolation between databases

---

## Bring-up checklist

```
[ ] System packages: Node 22.5, Erlang/OTP, rebar3, gcc (12 or any newer with CFLAGS workaround above), CMake
[ ] git submodule update --init --recursive          # populates HyperBEAM/
[ ] npm install                                       # populates node_modules + circom artifacts
[ ] Arweave JWK at HyperBEAM/.wallet.json
[ ] .env.hyperbeam at repo root (CC, CXX, CFLAGS=-Wno-error=incompatible-pointer-types -Wno-error=pointer-sign on modern GCC)
[ ] hb/.env.hyperbeam with CWD=../HyperBEAM (wao reads it from the test's cwd)
[ ] Module bundles for the gateway (cu/db-token tests fail with ENOENT '.modules/wdb.0.1.0.br' otherwise):
       cd core && npx esbuild src/db.js --bundle --format=esm --platform=node --outfile=wdb.min.js --minify
       cd core && npx brotli-cli compress wdb.min.js
       mkdir -p hb/src/.modules
       cp core/wdb.min.js.br  hb/src/.modules/wdb.0.1.0.br
       cp core/wdb.min.js.br  hb/src/.modules/wdb.0.1.1.br
       cp core/sst.min.js.br  hb/src/.modules/sst.0.1.0.br
       cp core/sst.min.js.br  hb/src/.modules/sst.0.1.1.br
[ ] ZK circuit artifacts (only needed for zkjson.test.js, server.test.js's "multiple zk proovers", or running the ZK Prover service):
       Source lives in https://github.com/weavedb/zkjson under `circom/{db,ipfs,query,rollup,json,collection}/`.
       hb expects three parameterizations under hb/src/circom/{db,db2,db3}/, which do NOT match the upstream
       `circom/db/index.circom` (it ships `DB(8, 168, 256, 4, 8)`). hb's defaults — set in
       node_modules/zkjson/esm/db.js — are `DB(level_col=24, level=184, size_json=256, size_path=32, size_val=256)`.
       To build:
       1. Install: `cargo install --git https://github.com/iden3/circom.git --locked` (gives circom 2.2.3+).
       2. Clone zkjson, install circomlib alongside: `cd circom && yarn add circomlib && mkdir ../node_modules
          && ln -s circom/node_modules/circomlib ../node_modules/circomlib`.
       3. Write a per-parameterization index.circom (e.g. db2/index.circom →
          `component main {public [col_key, key, path, val, col_root]} = DB(24, 184, 256, 32, 256);`).
       4. `circom index.circom --r1cs --wasm --sym` (~1 min).
       5. Get a powers-of-tau file large enough for the constraint count.
          Verified locally: db (DB(8,168,256,4,8)) is 134k constraints,
          db2 (DB(24,184,256,32,256)) is 152k — both fit comfortably in
          pot18 (262k cap). Hermez's `powersOfTau28_hez_final_NN.ptau`;
          the public S3 bucket flips to 403 sometimes —
          `https://storage.googleapis.com/zkevm/ptau/...` is a working mirror.
       6. `npx snarkjs groth16 setup index.r1cs pot.ptau index_0000.zkey`
          + `npx snarkjs zkey contribute index_0000.zkey index_0001.zkey -e<entropy>` (slow).
       7. Drop `index.r1cs`, `index_js/index.wasm`, `index_0001.zkey` into hb/src/circom/db2/ (and db, db3).
[ ] (Optional) Sepolia RPC + private key for ZK commits
[ ] Solidity contracts deployed on target chain (only if commitRoot is desired)
[ ] Boot order: hyperbeam → rollup → su → cu → bundler → validator → zkp
```

## See also

- `docs/docs/pages/ops/` — per-service ops mdx docs
- `hyperbeam.sh` — launcher and memory supervisor
- `scripts/run-*.js` — service entry points
- The planned `feat/cf-message-log` refactor will make all of section 1 except Rollup pluggable behind a `MessageLog` interface, with Cloudflare Durable Objects as the default — collapsing several of these dependencies (HyperBEAM, Erlang, rebar3, gcc-12) into "optional, for fully-decentralized deployments."
