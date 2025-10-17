import decode from "./dev_decode.js"

import normalize_sst from "./dev_normalize_sst.js"
import verify_sst from "./dev_verify_sst.js"
import auth_sst from "./dev_auth_sst.js"
import write_sst from "./dev_write_sst.js"
import parse_sst from "./dev_parse_sst.js"

import init from "./dev_init.js"
import put from "./dev_put.js"
import del from "./dev_del.js"
import upgrade from "./dev_upgrade.js"
import batch from "./dev_batch.js"
import revert from "./dev_revert.js"
import migrate from "./dev_migrate.js"
import add_index from "./dev_add_index.js"
import remove_index from "./dev_remove_index.js"
import set_auth from "./dev_set_auth.js"
import set_schema from "./dev_set_schema.js"
import add_trigger from "./dev_add_trigger.js"
import remove_trigger from "./dev_remove_trigger.js"

import normalize from "./dev_normalize.js"
import verify from "./dev_verify.js"
import parse from "./dev_parse.js"
import auth from "./dev_auth.js"
import write from "./dev_write.js"
import result from "./dev_result.js"

import read from "./dev_read.js"
import read_sst from "./dev_read_sst.js"
import build from "./build.js"
import kv from "./kv_nosql.js"

import { withOp } from "./utils.js"

const routes = {
  write: {
    devs: [
      normalize,
      verify,
      parse,
      auth,
      write,
      {
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
      },
      result,
    ],
  },
  pwrite: {
    async: true,
    devs: {
      sst: [normalize_sst, verify_sst, decode, parse_sst, auth_sst, write_sst],
    },
  },
  read: {
    devs: { main: [normalize, parse, read], sst: [normalize, parse, read_sst] },
  },
  pread: { async: true, devs: { sst: [normalize, parse, read_sst] } },
  get: { devs: [withOp("get"), parse, read] },
  cget: { devs: [withOp("cget"), parse, read] },
}

export default build({ kv, routes })
