import { of, ka } from "monade"
import migrate from "./dev_migrate_sst.js"
import batch from "./dev_batch_sst.js"
import parse from "./dev_parse.js"
import result from "./dev_result.js"
import init from "./dev_init_sst.js"
import { isNil, includes, difference, equals, keys, uniq } from "ramda"
import {
  normalizeIndex,
  addIndex as _addIndex,
  removeIndex as _removeIndex,
} from "./indexer.js"

function addIndex({ state, env: { kv, kv_dir } }) {
  const { data, dir, dirinfo } = state
  if (!Array.isArray(data)) throw Error("index must be Array")
  if (data.length < 2) throw Error("index must be multi fields")
  let indexes = kv.get("_config", `indexes_${dirinfo.index}`) ?? { indexes: [] }
  const _index = normalizeIndex(data)
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
  const _index = normalizeIndex(data)
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

export default function commit({ state, env }) {
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
          ts64: state.ts64,
          signer: state.signer,
          signer23: state.signer23,
          id: state.id,
          query: v,
        },
        msg: null,
        env: {
          info: env.kv.get("_config", "info"),
          kv: env.kv,
          kv_dir,
          no_commit: true,
        },
      }).map(op === "addIndex" ? addIndex : removeIndex)
    } else _batch.push([op, ...query])
  }
  of({
    state: {
      nonce: state.nonce,
      ts64: state.ts64,
      signer: state.signer,
      signer23: state.signer23,
      id: state.id,
      query: _batch,
    },
    msg: null,
    env: env,
  }).map(batch)
  state.result = { decode: true }
  return arguments[0]
}
