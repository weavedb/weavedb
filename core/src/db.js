import init from "./dev_init.js"
import put from "./dev_put.js"
import del from "./dev_del.js"
import batch from "./dev_batch.js"
import upgrade from "./dev_upgrade.js"
import revert from "./dev_revert.js"
import migrate from "./dev_migrate.js"
import add_index from "./dev_add_index.js"
import remove_index from "./dev_remove_index.js"
import mkdir from "./dev_mkdir.js"
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
import get from "./dev_get.js"
import t_noauth from "./tdev_noauth.js"

import init_sst from "./dev_init_sst.js"
import normalize_sst from "./dev_normalize_sst.js"
import verify_sst from "./dev_verify_sst.js"
import auth_sst from "./dev_auth_sst.js"
import write_sst from "./dev_write_sst.js"
import parse_sst from "./dev_parse_sst.js"
import upgrade_sst from "./dev_upgrade_sst.js"
import revert_sst from "./dev_revert_sst.js"
import migrate_sst from "./dev_migrate_sst.js"
import load from "./dev_load.js"
import decode from "./dev_decode.js"

import get_zkp_inputs from "./dev_get_zkp_inputs.js"
import read_sst from "./dev_read_sst.js"

import normalize_noauth from "./dev_normalize_noauth.js"

import build from "./build.js"
import kv from "./kv_nosql.js"

const main = {
  write: [
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
      mkdir,
    },
    result,
  ],
  read: [normalize, parse, read, { get }],
  get: [t_noauth("get"), parse, read, { get }],
  cget: [t_noauth("cget"), parse, read, { get }],
}

const sst = {
  write: {
    async: true,
    devs: [
      normalize_sst,
      verify_sst,
      decode,
      parse_sst,
      auth_sst,
      write_sst,
      {
        init: init_sst,
        migrate: migrate_sst,
        upgrade: upgrade_sst,
        revert: revert_sst,
        get,
        load,
      },
      result,
    ],
  },
  read: {
    async: true,
    devs: [normalize, parse, read_sst, { get, get_zkp_inputs }],
  },
}

const noauth = {
  write: [
    normalize_noauth,
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
      mkdir,
    },
    result,
  ],
  read: [normalize, parse, read, { get }],
  get: [t_noauth("get"), parse, read, { get }],
  cget: [t_noauth("cget"), parse, read, { get }],
}

export default build({ kv, routes: { main, sst, noauth } })
