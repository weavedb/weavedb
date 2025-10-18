function dev_init({
  state: { signer, id: _id, version: _version },
  msg: { db },
  env: {
    module_version,
    ignore_version,
    kv,
    info: { id, i, ts },
  },
}) {
  if (id) throw Error("already initialized")
  if (!db) throw Error("db is missing")
  let info = { i, id: _id, owner: signer, ts, db, total_size: 0 }
  if (_version) {
    if (module_version !== _version && ignore_version !== true) {
      throw Error(`the wrong version: ${_version} running on ${module_version}`)
    }
    info.version = _version
  }
  kv.put("__sst__", "info", info)
  return arguments[0]
}

export default dev_init
