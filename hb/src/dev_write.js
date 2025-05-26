import { validate } from "jsonschema"
import { of, fn } from "./monade.js"
import parse from "./dev_parse.js"
import auth from "./dev_auth.js"
import { parseOp, initDB } from "./dev_common.js"

import {
  addIndex as _addIndex,
  removeIndex as _removeIndex,
  put,
  del,
} from "../src/indexer.js"

import { isNil } from "ramda"

function addIndex({ state, env }) {
  _addIndex(state.data, [state.dir], env.kv_dir)
  return arguments[0]
}

function removeIndex({ state, env }) {
  _removeIndex(state.data, [state.dir], env.kv)
  return arguments[0]
}

function putData({ state, env: { kv, kv_dir } }) {
  const { data, dir, doc } = state
  if (isNil(kv.dir(dir))) throw Error("dir doesn't exist")
  put(data, doc, [dir.toString()], kv_dir, true)
  return arguments[0]
}

function delData({ state, env }) {
  const { dir, doc } = state
  if (isNil(env.kv.dir(dir))) throw Error("dir doesn't exist")
  del(doc, [dir], env.kv_dir)
  return arguments[0]
}

function validateSchema({ state, env: { kv } }) {
  let valid = false
  const { data, dir } = state
  let _dir = kv.dir(dir)
  try {
    valid = validate(data, _dir.schema).valid
  } catch (e) {}
  if (!valid) throw Error("invalid schema")
}

function batch({ state, env }) {
  for (const v of state.query) {
    of({
      state: {
        nonce: state.nonce,
        ts: state.ts,
        signer: state.signer,
        id: state.id,
        query: v,
      },
      msg: null,
      env: { kv: env.kv, no_commit: true },
    })
      .map(parseOp)
      .map(parse)
      .map(auth)
      .map(write)
  }
  return arguments[0]
}

const writer = {
  init: fn().map(initDB),
  set: fn().tap(validateSchema).map(putData),
  add: fn().tap(validateSchema).map(putData),
  upsert: fn().tap(validateSchema).map(putData),
  update: fn().tap(validateSchema).map(putData),
  del: fn().map(delData),
  addIndex: fn().map(addIndex),
  removeIndex: fn().map(removeIndex),
  batch: fn().map(batch),
}

function write({ state, msg, env: { no_commit, kv } }) {
  if (writer[state.opcode]) of(arguments[0]).chain(writer[state.opcode])
  if (no_commit !== true) kv.commit(msg)
  return arguments[0]
}

export default write
