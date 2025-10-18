export default function upgrade({ state, env: { kv, kv_dir, info } }) {
  info.upgrading = state.data
  kv.put("__sst__", `info`, info)
  return arguments[0]
}
