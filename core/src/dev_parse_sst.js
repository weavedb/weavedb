import { includes } from "ramda"
import { checkDocID } from "./utils.js"

function parse({ state, env }) {
  if (state.query) state.query.shift()
  if (state.opcode === "batch") return arguments[0]
  const { kv } = env
  let data, dir, doc
  if (includes(state.opcode, ["get", "cget"])) {
    ;[dir, doc] = state.query
    state.dir = dir
    if (typeof doc === "string") {
      checkDocID(doc, kv)
      state.doc = doc
      state.range = false
    } else state.range = true
    env.kv_dir = {
      get: k => kv.get("__indexes__", `${dir}/${k}`),
      put: (k, v, nosave) => kv.put("__indexes__", `${dir}/${k}`, v),
      del: (k, nosave) => kv.del("__indexes__", `${dir}/${k}`),
      data: key => ({
        val: kv.get(dir, key),
        __id__: key.split("/").pop(),
      }),
      putData: (key, val) => kv.put(dir, key, val),
      delData: key => kv.del(dir, key),
    }
  } else if (includes(state.opcode, ["upgrade"])) {
    ;[data] = state.query
    state.data = data
  }
  return arguments[0]
}
export default parse
