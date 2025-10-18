export default function revert({ state, env: { kv, kv_dir, info } }) {
  if (!info.upgrading) throw Error("not in the process of upgrading")
  delete info.upgrading
  kv.put("__sst__", `info`, info)
  return arguments[0]
}
