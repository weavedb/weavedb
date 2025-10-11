import { of } from "monade"
import version from "./dev_version.js"
import { includes } from "ramda"
function parse({ state, env }) {
  if (state.opcode === "batch") return arguments[0]
  const { kv } = env
  let data, dir, doc
  if (includes(state.opcode, ["upgrade"])) {
    state.query.shift()
    ;[data] = state.query
    state.data = data
  } else if (includes(state.opcode, ["revert", "migrate", "init"])) {
    state.query.shift()
  }
  of(arguments[0]).map(version)
  return arguments[0]
}
export default parse
