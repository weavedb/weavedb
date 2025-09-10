import { of, ka } from "monade"
import { validate } from "jsonschema"
import parse from "./dev_parse.js"
import auth from "./dev_auth.js"
import { putData, delData, validateSchema, parseOp, initDB } from "./utils.js"
import { isNil, includes, difference, equals, keys, uniq } from "ramda"
import trigger from "./dev_trigger.js"
import {
  addIndex as _addIndex,
  removeIndex as _removeIndex,
} from "./indexer.js"

function addTrigger({ state, env: { kv } }) {
  const { data, dir } = state
  if (!data.key) throw Error("key doesn't exist")
  if (!data.on) throw Error("on doesn't exist")
  if (
    difference(data.on.split(","), ["create", "update", "delete"]).length > 0
  ) {
    throw Error(`the wrong on: ${data.on}`)
  }
  if (data.fields) {
    if (!Array.isArray(data.fields)) throw Error("fields must be Array")
  }
  if (data.match) {
    if (!includes(data.match, ["all", "any", "none"]))
      throw Error(`the wrong type: ${data.match}`)
  }

  let conf = kv.get("_", dir)
  if (!conf) throw Error("dir doesn't exist")
  conf.triggers ??= {}
  conf.triggers[data.key] = {
    on: data.on,
    fn: data.fn,
    match: data.match ?? "all",
    fields: data.fields ?? null,
  }
  kv.put("_", dir, conf)
  return arguments[0]
}

function removeTrigger({ state, env: { kv } }) {
  const { data, dir } = state
  if (!data.key) throw Error("key doesn't exist")
  let conf = kv.get("_", dir)
  conf.triggers ??= {}
  if (!conf.triggers[data.key]) throw Error("trigger doesn't exist")
  delete conf.triggers[data.key]
  kv.put("_", dir, conf)
  return arguments[0]
}

function setRules({ state, env: { kv } }) {
  const { data, dir } = state
  let conf = kv.get("_", dir)
  if (!conf) throw Error("dir doesn't exist")
  console.log(conf.auth, data)
  conf.auth = data
  kv.put("_", dir, conf)
  return arguments[0]
}

function setSchema({ state, env: { kv } }) {
  const { data, dir } = state
  let conf = kv.get("_", dir)
  if (!conf) throw Error("dir doesn't exist")
  conf.schema = data
  kv.put("_", dir, conf)
  return arguments[0]
}

function addIndex({ state, env }) {
  _addIndex(state.data, [state.dir], env.kv_dir)
  return arguments[0]
}

function removeIndex({ state, env }) {
  _removeIndex(state.data, [state.dir], env.kv)
  return arguments[0]
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
  init: ka().map(initDB),
  set: ka().tap(validateSchema).map(putData).map(trigger),
  add: ka().tap(validateSchema).map(putData).map(trigger),
  upsert: ka().tap(validateSchema).map(putData).map(trigger),
  update: ka().tap(validateSchema).map(putData).map(trigger),
  del: ka().map(delData).map(trigger),
  addIndex: ka().map(addIndex),
  removeIndex: ka().map(removeIndex),
  addTrigger: ka().map(addTrigger),
  removeTrigger: ka().map(removeTrigger),
  setSchema: ka().map(setSchema),
  setRules: ka().map(setRules),
  batch: ka().map(batch),
}

function write({ state, msg, env: { no_commit, kv } }) {
  if (writer[state.opcode]) of(arguments[0]).chain(writer[state.opcode].fn())
  let result = null
  if (no_commit !== true) result = kv.commit(msg, null, state)
  state.result = result
  return arguments[0]
}

export default write
