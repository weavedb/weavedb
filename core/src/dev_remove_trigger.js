import { isNil } from "ramda"
export default function remove_trigger({ state, env: { kv } }) {
  const { data, dir, dirinfo } = state
  if (!data.key) throw Error("key doesn't exist")
  dirinfo.triggers ??= {}
  if (isNil(dirinfo.triggers[data.key])) throw Error("trigger doesn't exist")
  kv.del("_config", `triggers_${dirinfo.index}_${dirinfo.triggers[data.key]}`)
  delete dirinfo.triggers[data.key]
  kv.put("_", dir, dirinfo)
  return arguments[0]
}
