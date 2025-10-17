import { of, ka } from "monade"
import { parseOp } from "./utils.js"
import parse from "./dev_parse.js"
import auth from "./dev_auth.js"
import put from "./dev_put.js"
import del from "./dev_del.js"

const writer = {
  set: put,
  add: put,
  upsert: put,
  update: put,
  del,
}

function write({ state, msg, env: { no_commit, kv, info, branch } }) {
  if (writer[state.opcode]) of(arguments[0]).chain(writer[state.opcode].k)
  return arguments[0]
}

export default function batch({ state, env }) {
  for (const v of state.query) {
    of({
      state: {
        nonce: state.nonce,
        ts64: state.ts64,
        signer: state.signer,
        signer23: state.signer23,
        id: state.id,
        query: v,
      },
      msg: null,
      env: { kv: env.kv, no_commit: true, info: env.kv.get("_config", "info") },
    })
      .map(parseOp)
      .map(parse)
      .map(write)
  }
  return arguments[0]
}
