import draft_07 from "./jsonschema-draft-07.js"
import { validate } from "jsonschema"

export default function set_schema({ state, env: { kv } }) {
  const { data, dir, dirinfo } = state
  let valid = false
  try {
    valid = validate(data, draft_07).valid
  } catch (e) {}
  if (!valid) throw Error("invalid schema")
  kv.put("_config", `schema_${dirinfo.index}`, data)
  return arguments[0]
}
