import { includes, difference } from "ramda"

export default function add_trigger({ state, env: { kv } }) {
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
