import { of, fn } from "./monade.js"
import { parseOp, getInfo, initDB } from "./dev_common.js"

const writer = {
  init: fn().map(initDB),
}

function write({ state, msg, env: { no_commit, kv, cb } }) {
  if (writer[state.opcode]) of(arguments[0]).chain(writer[state.opcode])
  if (no_commit !== true) kv.commit(msg, cb)
  return arguments[0]
}

export default write
