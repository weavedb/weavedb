// End-to-end Miniflare pipeline tests.
//
// Boots the Worker + DO under workerd, signs real requests in Node with
// hbsig + http-message-signatures, dispatches them via worker.fetch,
// and asserts the full pipeline (verify → normalize → parse → auth →
// write → store) runs cleanly inside the Workers runtime.
//
// What this proves that miniflare.test.js does not:
//   - The DO can run the pipeline (verify accepts a real signature)
//   - core/ deps (ramda, fpjson-lang, jsonschema, etc.) work in workerd
//   - DO storage round-trips schema/auth/data through commit + reads
//   - Cross-request DO state continuity (init then read sees the init)
//
// Cost: ~1s of RSA-4096 keygen up front, then dispatches are fast.

import { describe, it, before, after } from "node:test"
import assert from "node:assert/strict"
import { unstable_dev } from "wrangler"
import {
  TestSigner,
  genJWK,
  init_query,
  users_query,
} from "./sign-helper.js"

let worker
let jwk
let signer
const PID = "test-pipeline-pid"

before(async () => {
  jwk = genJWK()
  signer = new TestSigner({ jwk, id: PID })
  worker = await unstable_dev("src/worker.js", {
    config: "wrangler.toml",
    experimental: { disableExperimentalWarning: true },
    vars: {
      HB_URL: "http://127.0.0.1:9", // unreachable; recover() exits early
      ADMIN_ONLY: "false",
      // No JWK secret: ADMIN_ONLY=false means anyone can init.
    },
  })
})

after(async () => {
  if (worker) await worker.stop()
})

async function readJson(res) {
  const t = await res.text()
  try {
    return JSON.parse(t)
  } catch {
    throw new Error(`expected JSON, got: ${t.slice(0, 200)}`)
  }
}

async function postSigned(query) {
  const signed = await signer.sign(...query)
  return await worker.fetch("/~weavedb@1.0/set", {
    method: "POST",
    headers: signed.headers,
    body: "",
  })
}

async function getQuery(query) {
  const queryStr = encodeURIComponent(JSON.stringify(query))
  return await worker.fetch(`/~weavedb@1.0/get?query=${queryStr}`, {
    headers: { id: PID },
  })
}

// PR 4b status:
//   ✅ INIT runs end-to-end through the full signed pipeline in workerd.
//   ✅ atob bug fixed — `cf/scripts/patch-atob.sh` covers all hbsig +
//      structured-headers + ethers + core/'s nested hbsig copies.
//
//   ⚠ Two distinct upstream bugs in core/src/ block the rest of the
//      signed pipeline. Fixing either requires editing core/, which is
//      outside this PR's no-regression scope. Both are tiny:
//
//   1. core/src/dev_init.js — hardcodes the default deny-auth instead of
//      installing query[0].auth from init_query. dirs_set never lands in
//      the auth registry, so set:dir gets "operation not allowed"
//      (default_auth in dev_auth.js:140 does exact full-op match against
//      v[0].split(",") — "set:dir" doesn't match "add,set,update,...").
//      Verified locally that `_auth = query[0]?.auth ?? <default>`
//      advances mkdir to the next stage.
//
//   2. dir_schema requires ["index", "schema", "auth"]. dirs_set's
//      `mod()` adds index, but schema validation appears to run against
//      a snapshot before mod() finishes augmenting state.data. Surfaces
//      after fix #1 as "Error: invalid schema" on mkdir.
const SKIP_AFTER_INIT =
  "blocked on two core/ bugs unrelated to workerd: (1) dev_init.js doesn't install init_query.auth; (2) schema validation runs before mod() augments data with index. Both are upstream — fix in a focused PR."

describe("Miniflare E2E: signed pipeline", () => {
  it("init succeeds with a valid signature (admin_only=false)",  async () => {
    const res = await postSigned(["init", init_query])
    const j = await readJson(res)
    assert.equal(res.status, 200, `init failed: ${JSON.stringify(j)}`)
    assert.equal(j.success, true, `init not success: ${JSON.stringify(j)}`)
  })

  it("creating a 'users' collection succeeds", async () => {
    const res = await postSigned(users_query)
    const j = await readJson(res)
    assert.equal(res.status, 200, `mkdir failed: ${JSON.stringify(j)}`)
    assert.equal(j.success, true, `mkdir not success: ${JSON.stringify(j)}`)
  })

  it("installing auth rules for 'users' succeeds", async () => {
    // mkdir creates the dir entry but doesn't install the auth rules into
    // the _config registry. setAuth populates _config/auth_${idx}_${i} and
    // updates dirinfo.auth to a {pattern: idx} map that default_auth uses.
    const res = await postSigned([
      "setAuth",
      [["set:user,add:user,update:user,upsert:user,del:user", [["allow()"]]]],
      "users",
    ])
    const j = await readJson(res)
    assert.equal(res.status, 200, `setAuth failed: ${JSON.stringify(j)}`)
    assert.equal(j.success, true, `setAuth not success: ${JSON.stringify(j)}`)
  })

  it("installing schema for 'users' succeeds", async () => {
    // Same as setAuth — mkdir doesn't wire data.schema into
    // _config/schema_${idx}. dev_schema.js looks it up by dirinfo.index.
    const res = await postSigned([
      "setSchema",
      { type: "object", required: ["name"] },
      "users",
    ])
    const j = await readJson(res)
    assert.equal(res.status, 200, `setSchema failed: ${JSON.stringify(j)}`)
    assert.equal(j.success, true, `setSchema not success: ${JSON.stringify(j)}`)
  })

  it("writing a user record succeeds", async () => {
    const res = await postSigned(["set:user", { name: "Bob" }, "users", "bob"])
    const j = await readJson(res)
    assert.equal(res.status, 200, `set:user failed: ${JSON.stringify(j)}`)
    assert.equal(j.success, true, `set:user not success: ${JSON.stringify(j)}`)
  })

  it("reading the user record returns the same data", async () => {
    const res = await getQuery(["get", "users", "bob"])
    const j = await readJson(res)
    assert.equal(res.status, 200)
    // Pipeline get response shape: {success, err, res: {result: <doc>, ...}}
    const name = j?.res?.result?.name
    assert.equal(name, "Bob", `unexpected get response: ${JSON.stringify(j)}`)
  })

  it("status reports ok with /status", async () => {
    const res = await worker.fetch("/status")
    const j = await readJson(res)
    assert.equal(j.status, "ok")
  })

  // Non-skipped check: the signature path itself is healthy. We exercise
  // verify+structured_to up to (but not into) the pipeline by sending an
  // unsigned request and asserting the right shape comes back.
  it("an unsigned /set is correctly rejected with 401 (proves verify works)", async () => {
    const res = await worker.fetch("/~weavedb@1.0/set", {
      method: "POST",
      headers: { id: "test-pipeline-pid" },
      body: "",
    })
    assert.equal(res.status, 401)
    const j = await readJson(res)
    assert.match(j.err, /invalid signature/)
  })
})
