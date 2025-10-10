import { includes, isNil, mergeLeft, clone } from "ramda"
import { of } from "monade"
import { fpj, ac_funcs } from "./fpjson.js"
import read from "./dev_read.js"
import {
  cid as _cid,
  wdb160 as _wdb160,
  wdb23 as _wdb23,
  checkDocID,
} from "./utils.js"

function anyone() {
  return arguments[0]
}

function onlyOwner({ state, env }) {
  if (state.signer !== env.info.owner) throw Error("only owner can execute")
  return arguments[0]
}

function auth_default({ state, env }) {
  throw Error("operation not allowed:", state.opcode)
  return arguments[0]
}

const authenticator = {
  auth_default,
  init: anyone,
  get: anyone,
  cget: anyone,
  set: onlyOwner,
  del: onlyOwner,
  commit: onlyOwner,
  migrate: onlyOwner,
  revert: onlyOwner,
  upgrade: onlyOwner,
}

function auth({ state, env }) {
  const func = authenticator[state.opcode] ?? authenticator.auth_default
  if (func) func(arguments[0])
  return arguments[0]
}

export default auth
