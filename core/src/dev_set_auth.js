export default function set_auth({ state, env: { kv } }) {
  const { data, dir, dirinfo } = state
  let auth = {}
  let auth_index = -1
  let len = data.length
  let old_len = (dirinfo.auth_index ?? -1) + 1
  if (!Array.isArray(data)) throw Error("auth must be an array")
  if (old_len > len) {
    for (let i = len; i < old_len; i++) {
      if (i >= len) kv.del("_config", `auth_${dirinfo.index}_${i}`)
    }
  }
  for (let v of data) {
    if (!Array.isArray(v)) throw Error("auth must be an array")
    auth[v[0]] = ++auth_index
    kv.put("_config", `auth_${dirinfo.index}_${auth_index}`, { rules: v })
  }
  if (auth_index === -1) delete dirinfo.auth_index
  else {
    dirinfo.auth_index = auth_index
  }
  dirinfo.auth = auth
  kv.put("_", dir, dirinfo)
  return arguments[0]
}
