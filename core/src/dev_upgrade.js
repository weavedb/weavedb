export default function upgrade({ state, env: { kv, kv_dir, info } }) {
  info.upgrading = state.data
  kv.put("_config", `info`, info)
  return arguments[0]
}
