import decode from "./dev_decode_zkp.js"

import normalize from "./dev_normalize_sst.js"
import verify from "./dev_verify_sst.js"
import auth from "./dev_auth_sst.js"
import write from "./dev_write_sst.js"
import parse_sst from "./dev_parse_sst.js"

import parse from "./dev_parse.js"
import read from "./dev_read.js"
import build from "./build.js"
import kv from "./kv_nosql.js"

function get({ state, msg }) {
  state.opcode = "get"
  state.query = ["get", ...msg]
  return arguments[0]
}

function cget({ state, msg }) {
  state.opcode = "cget"
  state.query = ["cget", ...msg]
  return arguments[0]
}

export default build({
  kv,
  async: true,
  write: [normalize, verify, decode, parse_sst, auth, write],
  read: [normalize, parse, read],
  __read__: {
    get: [get, parse, read],
    cget: [cget, parse, read],
  },
})
