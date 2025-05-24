import { of, fn } from "./monade.js"
import { parseOp, getInfo, initDB } from "./dev_common.js"
import parse from "./dev_parse.js"
import auth from "./dev_auth.js"
import write from "./dev_write.js"

function syncTable({
  state,
  msg,
  env: {
    sql,
    kv,
    info: { id, owner },
  },
}) {
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
      env: { kv, no_commit: true },
    })
      .map(parseOp)
      .map(getInfo)
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
  env: {
    sql,
    kv,
    info: { id, owner },
  },
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
        env: { kv, no_commit: true },
      })
        .map(parseOp)
        .map(getInfo)
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
  init: fn().map(initDB),
  createTable: fn().map(syncTable).map(syncAdd),
  add: fn().map(syncAdd),
}

function write_vec({ state, msg, env: { no_commit, kv, cb } }) {
  if (writer[state.opcode]) of(arguments[0]).chain(writer[state.opcode])
  if (no_commit !== true) kv.commit(msg, cb, state)
  return arguments[0]
}

export default write_vec
