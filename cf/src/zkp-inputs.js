// zkp-inputs — computes the circuit-ready encoded inputs for a given
// query, so the client can run `groth16.fullProve` locally.
//
// Mirrors core/src/dev_get_zkp_inputs.js semantically: read the
// dirinfo, run the planner to resolve the doc, then encode the
// (json, path, val) signal arrays using zkjson's pure encoder
// helpers. What we *don't* compute here is the SMT siblings + root —
// those require live SMT state, which the CF DO doesn't maintain in
// PR 3. PR 4 will fill that in: either via a sidecar prover with the
// SMT, or via a client-side SMT replay over R2 bundles.
//
// Why only the encoder, not the full zkjson DB tree:
//   The SMT machinery in zkjson (newMemEmptyTrie, circomlibjs/SMT)
//   imports buildPoseidon which calls `new Worker(...)` to parallelize
//   hashing in browsers — and that construct isn't available in
//   workerd. encoder.js is pure ramda + bignum and bundles cleanly.
//
// The endpoint surface is intentionally future-compatible: callers
// receive a complete `inputs` object today, with `siblings`,
// `col_siblings`, `root`, `col_root` filled by PR 4. Clients can
// inspect `meta.complete` to decide whether they have enough to
// prove yet.

// Import encoder via a relative path — zkjson's package.json "exports"
// doesn't whitelist ./esm/encoder.js, but a direct file path bypasses
// the subpath check (both in Node and in esbuild/wrangler). The
// encoder file itself only depends on ramda — pure functions, no
// Worker, no snarkjs.
import {
  encode,
  encodePath,
  encodeQuery,
  encodeVal,
  pad,
  toIndex,
  toSignal,
} from "../node_modules/zkjson/esm/encoder.js"
import { isNil } from "ramda"

// SDK defaults, matching node_modules/zkjson/esm/db.js. Callers can
// override via `params` if their circuit was compiled with different
// sizes (e.g. the existing hb/src/circom/db2/ uses bigger size_val and
// size_path).
const DEFAULTS = {
  size_json: 256,
  size_path: 4,
  size_val: 8,
  level: 168,
  level_col: 8,
}

/**
 * Compute the inputs that `groth16.fullProve` expects.
 *
 * @param {object} args
 * @param {object} args.io        DOIo or any sync-get adapter that mirrors core/src/kv.js
 * @param {string} args.dir       collection name (must not start with "_")
 * @param {string} args.doc       document id within the collection
 * @param {string} args.path      dot-separated path into the doc (e.g. "user.name")
 * @param {*}     [args.query]    optional query value (for range proofs)
 * @param {Partial<typeof DEFAULTS>} [args.params]  circuit size overrides
 * @returns {{ inputs: object, meta: object, success: boolean, err?: string }}
 */
export function computeZkpInputs({ io, dir, doc, path, query, params }) {
  const p = { ...DEFAULTS, ...(params ?? {}) }

  if (typeof dir !== "string" || dir.length === 0) {
    return { success: false, err: "dir is required" }
  }
  if (dir[0] === "_") {
    // Protocol filter: never produce inputs for the config namespace.
    // Matches the in-tree filter at core/src/dev_decode.js:131.
    return { success: false, err: "underscore-prefixed dirs are not in the zk tree" }
  }
  if (typeof doc !== "string" || doc.length === 0) {
    return { success: false, err: "doc is required" }
  }

  const dirinfo = io.get(["_", dir])
  if (isNil(dirinfo)) {
    return { success: false, err: `dir doesn't exist: ${dir}` }
  }
  if (isNil(dirinfo.index)) {
    return { success: false, err: `dir ${dir} has no zk collection index` }
  }

  const json = io.get([dir, doc])
  if (isNil(json)) {
    return { success: false, err: `doc doesn't exist: ${dir}/${doc}` }
  }

  // Encoded query inputs — pure functions, no SMT state needed.
  const json_signals = pad(toSignal(encode(json)), p.size_json)
  const path_signals = pad(toSignal(encodePath(path ?? "")), p.size_path)
  const val_signals = !isNil(query)
    ? pad(toSignal(encodeQuery(query)), p.size_val)
    : pad(toSignal(encodeVal(getVal(json, path))), p.size_val)

  return {
    success: true,
    inputs: {
      json: json_signals,
      path: path_signals,
      val: val_signals,
      key: toIndex(doc),
      col_key: dirinfo.index,
      // PR 4 fills these in (SMT siblings + roots):
      root: null,
      col_root: null,
      siblings: null,
      col_siblings: null,
    },
    meta: {
      dir,
      doc,
      col_id: dirinfo.index,
      params: p,
      // Whether the inputs are immediately usable by groth16.fullProve.
      // false until siblings/roots are filled by PR 4.
      complete: false,
    },
  }
}

/**
 * Resolve `getVal(json, "a.b[2].c")` style paths. Mirrors the same
 * function in node_modules/zkjson/esm/doc.js — vendored here so we
 * don't have to import doc.js (which would pull snarkjs).
 */
function getVal(j, p) {
  if (!p) return j
  return _getVal(j, p.split("."))
}

function _getVal(j, p) {
  if (p.length === 0) return j
  const sp = p[0].split("[")
  for (const v of sp) {
    if (/]$/.test(v)) j = j[Number(v.replace(/]$/, ""))]
    else j = j?.[v]
    if (isNil(j)) return null
  }
  return _getVal(j, p.slice(1))
}

export default computeZkpInputs
