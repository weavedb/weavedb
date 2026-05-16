// Prover — client-side groth16 proof generation for WeaveDB.
//
// Pairs with cf/src/zkp-inputs.js + the /~weavedb@1.0/zkp-inputs Worker
// route. The server returns the encoded circuit inputs; this wrapper
// loads the circuit's wasm + zkey lazily and feeds the inputs into
// snarkjs.groth16.fullProve. Same code path runs in browsers and Node —
// snarkjs handles both.
//
// Why on the client:
//   - Workers can't host snarkjs in-line (CPU + memory bounds + tens of
//     MB of zkey + seconds per proof).
//   - The user's `path`/`query`/`doc`/`val` stay in the SDK; the
//     server is blind to what the client is actually proving.
//   - Scales infinitely — proof cost is paid by whoever wants the proof.
//
// Designed to be runtime-agnostic:
//   - In Node: `new Prover({wasm: "/path/to/index.wasm", zkey: "/path/to/index_0001.zkey"})`
//     reads from disk.
//   - In browsers: pass URLs; snarkjs streams them.
//   - For both, the wasm + zkey are fetched at most once per process /
//     tab (Prover caches the URL it was constructed with; the
//     underlying snarkjs call may re-fetch but that's a Cache-Control
//     concern for the asset CDN, not us).

import { groth16 } from "snarkjs"

/**
 * @typedef {object} ProverInputs
 * Encoded circuit inputs as produced by cf/src/zkp-inputs.js.
 * `siblings`, `col_siblings`, `root`, `col_root` MUST be filled
 * before genProof — meta.complete from the server response indicates
 * whether the server already filled them or you need a separate
 * sibling source.
 */

export default class Prover {
  /**
   * @param {object} opts
   * @param {string} opts.wasm   path or URL to the circuit wasm
   * @param {string} opts.zkey   path or URL to the contributed zkey
   */
  constructor({ wasm, zkey } = {}) {
    if (!wasm || !zkey) {
      throw new TypeError("Prover: { wasm, zkey } both required")
    }
    this.wasm = wasm
    this.zkey = zkey
  }

  /**
   * Generate a groth16 proof from server-side inputs.
   *
   * Returns the canonical zkjson tuple shape:
   *   [pi_a[0], pi_a[1],
   *    pi_b[0][1], pi_b[0][0],   // reversed inner-pair
   *    pi_b[1][1], pi_b[1][0],   // reversed inner-pair
   *    pi_c[0], pi_c[1],
   *    ...publicSignals]
   * matching zkjson/esm/db.js#genProof's return shape so callers can
   * feed it straight to a Solidity verifier (or anywhere a zkjson
   * proof tuple is expected).
   *
   * @param {ProverInputs} inputs
   * @returns {Promise<string[]>}
   */
  async genProof(inputs) {
    if (!inputs || typeof inputs !== "object") {
      throw new TypeError("Prover.genProof: inputs object required")
    }
    if (
      inputs.siblings == null ||
      inputs.root == null ||
      inputs.col_siblings == null ||
      inputs.col_root == null
    ) {
      throw new TypeError(
        "Prover.genProof: inputs.siblings/root/col_siblings/col_root must be set " +
          "(see meta.complete from /~weavedb@1.0/zkp-inputs)",
      )
    }
    const { proof, publicSignals } = await groth16.fullProve(
      inputs,
      this.wasm,
      this.zkey,
    )
    return [
      ...proof.pi_a.slice(0, 2),
      ...proof.pi_b[0].slice(0, 2).reverse(),
      ...proof.pi_b[1].slice(0, 2).reverse(),
      ...proof.pi_c.slice(0, 2),
      ...publicSignals,
    ]
  }

  /**
   * Generate the raw snarkjs `{proof, publicSignals}` instead of the
   * zkjson-flat tuple. Useful when the caller wants to verify locally
   * with groth16.verify (which expects the structured shape).
   *
   * @param {ProverInputs} inputs
   * @returns {Promise<{proof: object, publicSignals: string[]}>}
   */
  async genRaw(inputs) {
    if (!inputs || typeof inputs !== "object") {
      throw new TypeError("Prover.genRaw: inputs object required")
    }
    return await groth16.fullProve(inputs, this.wasm, this.zkey)
  }
}

/**
 * Fetch encoded inputs from a running CF Worker (or hb rollup, since
 * both serve the same /~weavedb@1.0/zkp-inputs surface).
 *
 * The returned object follows the cf/src/zkp-inputs.js contract:
 *   { success: true, inputs: {...}, meta: {...} }
 * Caller is responsible for filling siblings/root before genProof
 * if `meta.complete === false`.
 *
 * @param {object} args
 * @param {string} args.url        rollup base URL, e.g. https://rollup.example.com
 * @param {string} args.pid        process id (id header)
 * @param {string} args.dir        collection name
 * @param {string} args.doc        document id
 * @param {string} [args.path=""]  dot-separated path into the doc
 * @param {*}     [args.query]     optional range/op query
 * @param {object} [args.params]   circuit size overrides
 * @param {typeof fetch} [args.fetch] override (for tests)
 */
export async function fetchZkpInputs({
  url,
  pid,
  dir,
  doc,
  path = "",
  query,
  params,
  fetch: _fetch,
} = {}) {
  if (!url || !pid || !dir || !doc) {
    throw new TypeError(
      "fetchZkpInputs: { url, pid, dir, doc } are required",
    )
  }
  const f = _fetch ?? fetch
  const u = new URL(`${String(url).replace(/\/+$/, "")}/~weavedb@1.0/zkp-inputs`)
  u.searchParams.set("dir", dir)
  u.searchParams.set("doc", doc)
  if (path) u.searchParams.set("path", path)
  if (query != null) u.searchParams.set("query", JSON.stringify(query))
  if (params) u.searchParams.set("params", JSON.stringify(params))

  const res = await f(u.toString(), {
    method: "GET",
    headers: { id: pid },
  })
  if (!res.ok) {
    throw new Error(`fetchZkpInputs: ${res.status} ${await res.text()}`)
  }
  return await res.json()
}
