import { validate } from "jsonschema"
export default function schema({ state, env: { kv, info } }) {
  let valid = false
  const { data, dir } = state
  let _schema = kv.get("_config", `schema_${state.dirinfo.index}`)
  try {
    valid = validate(data, _schema).valid
  } catch (e) {}
  const len = JSON.stringify(data).length
  if (!valid) throw Error("invalid schema")
  if (info.max_doc_size * 20 < len)
    throw Error(`data too large: ${len} bytes (max: ${info.max_doc_size * 20})`)
  return arguments[0]
}
