import { of, ka } from "monade"
import { parseOp } from "./utils.js"
import init from "./dev_init.js"
import parse from "./dev_parse.js"
import auth from "./dev_auth.js"
import write from "./dev_write.js"

function syncTable({ state, msg, env: { kv, id, owner } }) {
  try {
    const { ts, nonce, op, query, ast } = state
    const table_name = query[0]
    const schema = { type: "object" }
    of({
      state: {
        nonce,
        ts,
        signer: owner,
        id,
        query: [
          "set:dir",
          {
            schema,
            auth: [["set,add,update,upsert,del", [["allow()"]]]],
          },
          "_",
          table_name,
        ],
      },
      msg: null,
      env: { kv, no_commit: true, id, owner },
    })
      .map(parseOp)
      .map(parse)
      .map(auth)
      .map(write)
  } catch (e) {
    console.log(e)
  }
  return arguments[0]
}

function syncAdd({
  state: { ts, nonce, op, query, ast },
  msg,
  env: { kv, id, owner },
}) {
  try {
    for (const v of query[1] ?? []) {
      let _state = {
        nonce,
        ts,
        signer: owner,
        id,
        query: ["add", v, query[0]],
      }
      of({
        state: _state,
        msg: null,
        env: { kv, no_commit: true, id, owner },
      })
        .map(parseOp)
        .map(parse)
        .map(auth)
        .map(write)
      v.__id__ = _state.doc
    }
  } catch (e) {
    console.log(e, query[0])
  }

  return arguments[0]
}

const writer = {
  init: ka().map(init),
  createTable: ka().map(syncTable).map(syncAdd),
  add: ka().map(syncAdd),
}

function write_vec({ state, msg, env: { no_commit, kv, cb } }) {
  let result = null
  if (writer[state.opcode]) of(arguments[0]).chain(writer[state.opcode].fn())
  if (no_commit !== true) result = kv.commit(msg, cb, state)
  state.result = result
  return arguments[0]
}

export default write_vec
