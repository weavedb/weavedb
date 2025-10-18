import { addIndex, normalizeIndex } from "./indexer.js"
import { equals } from "ramda"

export default function add_index({ state, env: { kv, kv_dir } }) {
  const { data, dir, dirinfo } = state
  if (!Array.isArray(data)) throw Error("index must be Array")
  if (data.length < 2) throw Error("index must be multi fields")
  let indexes = kv.get("_config", `indexes_${dirinfo.index}`) ?? { indexes: [] }
  const _index = normalizeIndex(data)
  for (let v of indexes.indexes || []) {
    if (equals(_index, v)) throw Error("index already exists:", _index)
  }
  indexes.indexes.push(_index)
  addIndex(data, [dir], kv_dir)
  kv.put("_config", `indexes_${dirinfo.index}`, indexes)
  return arguments[0]
}
