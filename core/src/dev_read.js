import { of, ka } from "monade"
import { map, pluck, isNil } from "ramda"
import parseQuery from "./parser.js"
import { get } from "./planner.js"

function getDocs({ state, env }) {
  const { dir, doc } = state
  const _dir = env.kv.get("_", dir)
  if (isNil(_dir)) throw Error(`dir doesn't exist: ${dir}`)
  const parsed = parseQuery(state.query)
  const res = get(parsed, env.kv_dir)
  if (state.opcode === "cget") {
    state.result = state.range
      ? map(v => ({ __cursor__: true, dir: dir, id: v.key, data: v.val }))(res)
      : { __cursor__: true, dir: dir, id: res.key, data: res.val }
  } else {
    state.result = state.range ? pluck("val")(res) : res.val
  }
  return arguments[0]
}

const reader = {
  get: ka().map(getDocs),
  cget: ka().map(getDocs),
}

const toResult = ({ state }) => state.result

function read({ state }) {
  return of(arguments[0]).chain(reader[state.opcode].fn()).to(toResult)
}

export default read
