// Workers-only WeaveDB pipeline.
//
// Mirrors core/src/db.js's `main` and `noauth` routes verbatim, but skips
// the `sst` route and its eager imports (dev_decode.js, dev_init_sst.js,
// dev_get_zkp_inputs.js, ...). Those imports transitively pull in
// `zkjson` → `ffjavascript`'s browser ESM, which references the `Worker`
// constructor — present in browsers, absent in the Cloudflare runtime
// (workerd). Importing them at module-load time crashes the bundle.
//
// Why duplicate the route definitions instead of patching core/src/db.js?
//   We're committed to zero regression on existing code (PR 1–4 spec).
//   Lazy-loading SST would alter behavior for the Node rollup. Carrying
//   a parallel construction in cf/ is the smallest blast radius.
//
// What's lost in CF mode:
//   - SST writes (zk-bound async commit path)
//   - `get_zkp_inputs` reads (proof witness extraction)
//   - `load`/`decode` ops (used by the SST commit pipeline)
//
// These all live in the validator/ZK-prover stack in HyperBEAM mode and
// are not part of the rollup's responsibility, so the omission is safe.

import init from "../../core/src/dev_init.js"
import put from "../../core/src/dev_put.js"
import del from "../../core/src/dev_del.js"
import batch from "../../core/src/dev_batch.js"
import upgrade from "../../core/src/dev_upgrade.js"
import revert from "../../core/src/dev_revert.js"
import migrate from "../../core/src/dev_migrate.js"
import add_index from "../../core/src/dev_add_index.js"
import remove_index from "../../core/src/dev_remove_index.js"
import mkdir from "../../core/src/dev_mkdir.js"
import set_auth from "../../core/src/dev_set_auth.js"
import set_schema from "../../core/src/dev_set_schema.js"
import add_trigger from "../../core/src/dev_add_trigger.js"
import remove_trigger from "../../core/src/dev_remove_trigger.js"
import normalize from "../../core/src/dev_normalize.js"
import normalize_noauth from "../../core/src/dev_normalize_noauth.js"
import verify from "../../core/src/dev_verify.js"
import parse from "../../core/src/dev_parse.js"
import auth from "../../core/src/dev_auth.js"
import write from "../../core/src/dev_write.js"

import result from "../../core/src/dev_result.js"
import read from "../../core/src/dev_read.js"
import get from "../../core/src/dev_get.js"
import t_noauth from "../../core/src/tdev_noauth.js"

import build from "../../core/src/build.js"
import kv from "../../core/src/kv_nosql.js"

const ops = {
  init,
  put,
  del,
  batch,
  upgrade,
  revert,
  migrate,
  add_index,
  remove_index,
  set_auth,
  set_schema,
  add_trigger,
  remove_trigger,
  mkdir,
}

const main = {
  write: [normalize, verify, parse, auth, write, ops, result],
  read: [normalize, parse, read, { get }],
  get: [t_noauth("get"), parse, read, { get }],
  cget: [t_noauth("cget"), parse, read, { get }],
}

const noauth = {
  write: [normalize_noauth, verify, parse, auth, write, ops, result],
  read: [normalize, parse, read, { get }],
  get: [t_noauth("get"), parse, read, { get }],
  cget: [t_noauth("cget"), parse, read, { get }],
}

export default build({ kv, routes: { main, noauth } })
