import version from "./version_sst.js"

function dev_init({
  state: { query, signer, id: _id },
  msg: { db },
  env: {
    ignore_version,
    kv,
    info: { id, i, ts },
  },
}) {
  if (id) throw Error("already initialized")
  if (!db) throw Error("db is missing")
  let info = { i, id: _id, owner: signer, ts, db }
  if (query[0].version) {
    if (version !== query[0].version && ignore_version !== true) {
      throw Error(
        `the wrong version: ${query[0].version} running on ${version}`,
      )
    }
    info.version = query[0].version
  }
  kv.put("__sst__", "info", info)
  return arguments[0]
}

export default dev_init
