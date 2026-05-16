function dev_init({
  state: { query, signer, id: _id },
  msg,
  env: {
    module_version,
    ignore_version,
    kv,
    info: { id, i, hashpath, ts },
  },
}) {
  if (id) throw Error("already initialized")
  // Honor user-supplied auth/schema from init_query when present, else fall
  // back to the existing hardcoded defaults (existing callers that don't
  // supply these fields see no behavior change).
  const _auth = Array.isArray(query[0]?.auth)
    ? query[0].auth
    : [["add,set,update,upsert,del", [["deny()"]]]]
  const _schema =
    query[0]?.schema && typeof query[0].schema === "object"
      ? query[0].schema
      : {
          type: "object",
          required: ["index"],
          properties: {
            index: { type: "number" },
            auth: { type: "object" },
            triggers: { type: "object" },
          },
        }

  let auth = {}
  let auth_index = -1
  for (let v of _auth) {
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
    last_dir_id: 2, // _, _config, _accounts already occupy indexes 0, 1, 2
    i,
    id: _id,
    owner: signer,
    ts,
    max_doc_id: 168,
    max_dir_id: 8,
    max_doc_size: 256,
  }
  if (query[0].branch) info.branch = query[0].branch
  if (hashpath) info.hashpath = hashpath
  if (query[0].version) {
    if (module_version !== query[0].version && ignore_version !== true) {
      throw Error(
        `the wrong version: ${query[0].version} running on ${module_version}`,
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
  kv.put("_config", "schema_0", _schema)
  return arguments[0]
}

export default dev_init
