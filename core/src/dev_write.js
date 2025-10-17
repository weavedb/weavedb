const br = {
  set: "put",
  add: "put",
  upsert: "put",
  update: "put",
  del: "del",
  addTrigger: "add_trigger",
  removeTrigger: "remove_trigger",
  setSchema: "set_schema",
  setAuth: "set_auth",
  addIndex: "add_index",
  removeIndex: "remove_index",
  init: "init",
  upgrade: "upgrade",
  revert: "revert",
  migrate: "migrate",
  batch: "batch",
}

function write({ state, msg, env: { no_commit, kv, info, branch } }) {
  if (br[state.opcode]) state.branch = br[state.opcode]
  return arguments[0]
}

export default write
