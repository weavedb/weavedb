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

  let stat = kv.get("_", dir)
  if (!stat) throw Error("dir doesn't exist")
  stat.triggers ??= {}
  stat.triggers[data.key] = {
    on: data.on,
    fn: data.fn,
    match: data.match ?? "all",
    fields: data.fields ?? null,
  }
  kv.put("_", dir, stat)
  return arguments[0]
}

function removeTrigger({ state, env: { kv } }) {
  const { data, dir } = state
  if (!data.key) throw Error("key doesn't exist")
  let stat = kv.get("_", dir)
  stat.triggers ??= {}
  if (!stat.triggers[data.key]) throw Error("trigger doesn't exist")
  delete stat.triggers[data.key]
  kv.put("_", dir, stat)
  return arguments[0]
}

function setAuth({ state, env: { kv } }) {
  const { data, dir } = state
  let stat = kv.get("_", dir)
  if (!stat) throw Error("dir doesn't exist")
  stat.auth = data
  kv.put("_", dir, stat)
  return arguments[0]
}

function setSchema({ state, env: { kv } }) {
  const { data, dir } = state
  let stat = kv.get("_", dir)
  if (!stat) throw Error("dir doesn't exist")
  if (data.type !== "object") throw Error("type must be object")
  stat.schema = data
  kv.put("_", dir, stat)
  return arguments[0]
}

function normalize(index) {
  for (const i of index) {
    if (!Array.isArray(i)) throw Error("index must be Array")
    if (i.length > 2 || i.length < 1) throw Error("the wrong index")
    if (i.length === 1) i.push("asc")
  }
  return index
}
function addIndex({ state, env: { kv, kv_dir } }) {
  const { data, dir } = state
  if (!Array.isArray(data)) throw Error("index must be Array")
  if (data.length < 2) throw Error("index must be multi fields")
  let stat = kv.get("_", dir)
  if (!stat) throw Error("dir doesn't exist")
  stat.indexes ??= []
  const _index = normalize(data)
  for (let v of stat.indexes) {
    if (equals(_index, v)) throw Error("index already exists")
  }
  stat.indexes.push(_index)
  _addIndex(data, [dir], kv_dir)
  kv.put("_", dir, stat)
  return arguments[0]
}

function removeIndex({ state, env: { kv, kv_dir } }) {
  const { data, dir } = state
  let stat = kv.get("_", dir)
  if (!stat) throw Error("dir doesn't exist")
  stat.indexes ??= []
  let new_indexes = []
  const _index = normalize(data)
  let ex = false
  for (let v of stat.indexes) {
    if (equals(_index, v)) ex = true
    else new_indexes.push(v)
  }
  if (!ex) throw Error("index doesn't exist")
  _removeIndex(data, [dir], kv_dir)
  stat.indexes = new_indexes
  kv.put("_", dir, stat)
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
  setAuth: ka().map(setAuth),
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
