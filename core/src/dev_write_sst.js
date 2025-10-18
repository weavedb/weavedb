const br = {
  init: "init",
  migrate: "migrate",
  upgrade: "upgrade",
  revert: "revert",
  get: "get",
  cget: "get",
  commit: "load",
}

function write({ state, msg, env: { no_commit, kv, info } }) {
  if (br[state.opcode]) state.branch = br[state.opcode]
  return arguments[0]
}

export default write
