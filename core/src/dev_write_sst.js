import { of, ka } from "monade"
import migrate from "./dev_migrate_sst.js"
import write_core from "./dev_write.js"
import read from "./dev_read.js"
import draft_07 from "./jsonschema-draft-07.js"
import { validate } from "jsonschema"
import parse from "./dev_parse.js"
import auth from "./dev_auth.js"
import { putData, delData, validateSchema, parseOp } from "./utils.js"
import init from "./dev_init.js"
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
  let indexes = kv.get("_config", `indexes_${dirinfo.index}`) ?? { indexes: [] }
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
  kv.put("_config", `indexes_${dirinfo.index}`, indexes)
  return arguments[0]
}

function batch({ state, env }) {
  for (const v of state.query) {
    of({
      state: {
        nonce: state.nonce,
        ts: state.ts,
        signer: state.signer,
        signer23: state.signer23,
        id: state.id,
        query: v,
      },
      msg: null,
      env: { kv: env.kv, no_commit: true, info: env.info },
    })
      .map(parseOp)
      .map(parse)
      .map(write_core)
  }
  return arguments[0]
}

function commit({ state, env }) {
  if (state.decode_error) {
    state.result = { decode: false }
    env.kv.put("__results__", `${env.info.i}`, { decode: false })
    return arguments[0]
  } else {
    let _batch = []
    for (const v of state.updates) {
      const [op, query] = v
      if (op === "addIndex" || op === "removeIndex") {
        const dir = query[1]
        const dirinfo = env.kv.get("_", dir)
        const kv_dir = {
          get: k => env.kv.get("__indexes__", `${dir}/${k}`),
          put: (k, v, nosave) => env.kv.put("__indexes__", `${dir}/${k}`, v),
          del: (k, nosave) => env.kv.del("__indexes__", `${dir}/${k}`),
          data: key => ({
            val: env.kv.get(dir, key),
            __id__: key.split("/").pop(),
          }),
          putData: (key, val) => env.kv.put(dir, key, val),
          delData: key => env.kv.del(dir, key),
        }
        of({
          state: {
            dir,
            dirinfo,
            data: query[0],
            nonce: state.nonce,
            ts: state.ts,
            signer: state.signer,
            signer23: state.signer23,
            id: state.id,
            query: v,
          },
          msg: null,
          env: { info: env.info, kv: env.kv, kv_dir, no_commit: true },
        }).map(op === "addIndex" ? addIndex : removeIndex)
      } else _batch.push([op, ...query])
    }
    of({
      state: {
        nonce: state.nonce,
        ts: state.ts,
        signer: state.signer,
        signer23: state.signer23,
        id: state.id,
        query: _batch,
      },
      msg: null,
      env: env,
    }).map(batch)
    state.result = { decode: true }
    env.kv.put("__results__", `${env.info.i}`, { decode: true })
    return arguments[0]
  }
}
function get({ state, env }) {
  state.result = of(arguments[0]).map(parse).map(read).val()
  env.kv.put("__results__", `${env.info.i}`, state.result)
  return arguments[0]
}

function upgrade({ state, env: { kv, kv_dir, info } }) {
  info.upgrading = state.data
  kv.put("_config", `info`, info)
  return arguments[0]
}

function revert({ state, env: { kv, kv_dir, info } }) {
  if (!info.upgrading) throw Error("not in the process of upgrading")
  delete info.upgrading
  kv.put("_config", `info`, info)
  return arguments[0]
}

const writer = {
  init: ka().map(init),
  commit: ka().map(commit),
  get: ka().map(get),
  cget: ka().map(get),
  upgrade: ka().map(upgrade),
  revert: ka().map(revert),
  migrate: ka().map(migrate),
}

function write({ state, msg, env: { no_commit, kv, info } }) {
  if (writer[state.opcode]) of(arguments[0]).chain(writer[state.opcode].fn())
  if (no_commit !== true) {
    const { data } = kv.commit(msg, null, state, info)
    state.updates = data
  }
  state.result ??= null
  state.i = info.i
  state.ts = info.ts
  return arguments[0]
}

export default write
