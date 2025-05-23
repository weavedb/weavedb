import { of, fn } from "./monade.js"
import { parseOp, getInfo } from "./dev_common.js"

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

const writer = {
  init: fn().map(initDB),
}

function write({ state, msg, env: { no_commit, kv } }) {
  if (writer[state.opcode]) of(arguments[0]).chain(writer[state.opcode])
  if (no_commit !== true) kv.commit(msg)
  return arguments[0]
}

export default write
