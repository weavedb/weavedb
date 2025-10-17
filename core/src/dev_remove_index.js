import { normalizeIndex } from "./utils.js"
import { equals } from "ramda"
import { removeIndex } from "./indexer.js"

export default function remove_index({ state, env: { kv, kv_dir } }) {
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
  removeIndex(data, [dir], kv_dir)
  indexes.indexes = new_indexes
  kv.put("_config", `indexes_${dirinfo.index}`, indexes)
  return arguments[0]
}
