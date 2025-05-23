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

export { parseOp, getInfo }
