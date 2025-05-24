function parseOp({ state }) {
  state.op = state.query[0]
  state.opcode = state.op.split(":")[0]
  state.operand = state.op.split(":")[1] ?? null
  return arguments[0]
}

function getInfo({ state, env }) {
  env.info =
    state.opcode === "init"
      ? { owner: state.signer, id: state.id }
      : env.kv.get("_config", "info")
  if (env.info === null) throw Error("database not initialized")
  if (env.info.id !== state.id) throw Error("the wrong id")
  return arguments[0]
}

function initDB({
  state: { query },
  msg,
  env: {
    kv,
    info: { id, owner },
  },
}) {
  if (kv.dir("_")) throw Error("already initialized")
  kv.put("_", "_", { ...query[0], index: 0 })
  kv.put("_", "_config", {
    index: 1,
    schema: { type: "object", additionalProperties: false },
    auth: [],
  })
  kv.put("_", "__indexes__", {
    index: 2,
    schema: { type: "object" },
    auth: [],
  })
  kv.put("_", "__accounts__", {
    index: 3,
    schema: { type: "object" },
    auth: [],
  })
  kv.put("_config", "info", {
    id,
    owner,
    last_dir_id: 3,
  })
  kv.put("_config", "config", { max_doc_id: 168, max_dir_id: 8 })
  return arguments[0]
}

export { parseOp, getInfo, initDB }
