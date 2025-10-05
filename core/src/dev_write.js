import { of, ka } from "monade"
import draft_07 from "./jsonschema-draft-07.js"
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
  const { data, dir, dirinfo } = state
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

  dirinfo.triggers ??= {}
  dirinfo.triggers_index = -1
  dirinfo.triggers[data.key] = ++dirinfo.triggers_index
  const triggers = {
    on: data.on,
    fn: data.fn,
    match: data.match ?? "all",
    fields: data.fields ?? null,
  }
  kv.put("_", dir, dirinfo)
  kv.put(
    "_config",
    `triggers_${dirinfo.index}_${dirinfo.triggers[data.key]}`,
    triggers,
  )
  return arguments[0]
}

function removeTrigger({ state, env: { kv } }) {
  const { data, dir, dirinfo } = state
  if (!data.key) throw Error("key doesn't exist")
  dirinfo.triggers ??= {}
  if (isNil(dirinfo.triggers[data.key])) throw Error("trigger doesn't exist")
  kv.del("_config", `triggers_${dirinfo.index}_${dirinfo.triggers[data.key]}`)
  delete dirinfo.triggers[data.key]
  kv.put("_", dir, dirinfo)
  return arguments[0]
}

function setAuth({ state, env: { kv } }) {
  const { data, dir, dirinfo } = state
  let auth = {}
  let auth_index = -1
  let len = data.length
  let old_len = (dirinfo.auth_index ?? -1) + 1
  if (!Array.isArray(data)) throw Error("auth must be an array")
  if (old_len > len) {
    for (let i = len; i < old_len; i++) {
      if (i >= len) kv.del("_config", `auth_${dirinfo.index}_${i}`)
    }
  }
  for (let v of data) {
    if (!Array.isArray(v)) throw Error("auth must be an array")
    auth[v[0]] = ++auth_index
    kv.put("_config", `auth_${dirinfo.index}_${auth_index}`, { rules: v })
  }
  if (auth_index === -1) delete dirinfo.auth_index
  else {
    dirinfo.auth_index = auth_index
  }
  dirinfo.auth = auth
  kv.put("_", dir, dirinfo)
  return arguments[0]
}

function setSchema({ state, env: { kv } }) {
  const { data, dir, dirinfo } = state
  let valid = false
  try {
    valid = validate(data, draft_07).valid
  } catch (e) {}
  if (!valid) throw Error("invalid schema")
  kv.put("_config", `schema_${dirinfo.index}`, data)
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
  const { data, dir, dirinfo } = state
  if (!Array.isArray(data)) throw Error("index must be Array")
  if (data.length < 2) throw Error("index must be multi fields")
  let indexes = kv.get("_config", `indexes_${state.index}`) ?? { indexes: [] }
  const _index = normalize(data)
  for (let v of indexes.indexes || []) {
    if (equals(_index, v)) throw Error("index already exists:", _index)
  }
  indexes.indexes.push(_index)
  _addIndex(data, [dir], kv_dir)
  kv.put("_config", `indexes_${dirinfo.index}`, indexes)
  return arguments[0]
}

function removeIndex({ state, env: { kv, kv_dir } }) {
  const { data, dir, dirinfo } = state
  let indexes = kv.get("_config", `indexes_${dirinfo.index}`) ?? {
    indexes: [],
  }
  let new_indexes = []
  const _index = normalize(data)
  let ex = false
  for (let v of indexes.indexes) {
    if (equals(_index, v)) ex = true
    else new_indexes.push(v)
  }
  if (!ex) throw Error("index doesn't exist")
  _removeIndex(data, [dir], kv_dir)
  indexes.indexes = new_indexes
  kv.put("_config", `indexes_${state.index}`, indexes)
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
