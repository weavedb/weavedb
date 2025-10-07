import version from "./version.js"

function dev_init({
  state: { query, signer, id: _id, module },
  msg,
  env: {
    ignore_version,
    kv,
    info: { id, i, hashpath, ts },
  },
}) {
  if (id) throw Error("already initialized")
  if (!query[0].schema) throw Error("schema is missing")
  if (!query[0].auth) throw Error("auth is missing")
  let auth = {}
  let auth_index = -1
  for (let v of query[0].auth) {
    auth[v[0]] = ++auth_index
    kv.put("_config", `auth_0_${auth_index}`, { rules: v })
  }
  kv.put("_", "_", { auth, triggers: {}, index: 0, auth_index })
  kv.put("_", "_config", {
    index: 1,
    schema: { type: "object", additionalProperties: false },
    auth: [],
  })
  let info = {
    dirs: 3,
    hashpath,
    i,
    id: _id,
    owner: signer,
    ts,
    max_doc_id: 168,
    max_dir_id: 8,
    max_doc_size: 256,
  }
  if (query[0].version) {
    if (version !== query[0].version && ignore_version !== true) {
      throw Error(
        `the wrong version: ${query[0].version} running on ${version}`,
      )
    }
    info.version = query[0].version
  }
  kv.put("_config", "info", info)
  kv.put("_", "_accounts", {
    index: 2,
    schema: { type: "object", additionalProperties: false },
    auth: [],
  })
  kv.put("_config", "schema_0", query[0].schema)
  return arguments[0]
}

export default dev_init
