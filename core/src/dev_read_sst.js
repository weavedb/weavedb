import { pof, pka } from "monade"
import { map, pluck, isNil, pick } from "ramda"
import parseQuery from "./parser.js"
import { get } from "./planner.js"
import { DBTree } from "zkjson"

async function getInputs({ state, env }) {
  const { dirinfo, doc, data, json } = state
  const { kv } = env
  const kv_zkp = key => ({
    get: k => kv.get("__zkp__", `${key}_${k}`),
    put: (k, v) => kv.put("__zkp__", `${key}_${k}`, v),
    del: k => kv.del("__zkp__", `${key}_${k}`),
  })
  let params = pick(
    ["size_json", "level_col", "level", "size_val", "size_path"],
    data,
  )
  let params_input = pick(["query", "path"], data)
  const zkdb = new DBTree({ kv: kv_zkp, ...params })
  await zkdb.init()
  const inputs = await zkdb.getInputs({
    json: json,
    col_id: dirinfo.index,
    id: doc,
    ...params_input,
  })
  state.result = {
    i: env.info.i,
    zkhash: zkdb.hash(),
    inputs,
  }
  return arguments[0]
}

function getDocs({ state, env }) {
  const { dir, doc } = state
  if (state.opcode === "getInputs" && !doc) throw Error("doc is missing")
  const _dir = env.kv.get("_", dir)
  if (isNil(_dir)) throw Error(`dir doesn't exist: ${dir}`)
  const parsed = parseQuery(state.query)
  const res = get(parsed, env.kv_dir)
  if (state.opcode === "cget") {
    state.result = state.range
      ? map(v => ({ __cursor__: true, dir: dir, id: v.key, data: v.val }))(res)
      : { __cursor__: true, dir: dir, id: res.key, data: res.val }
  } else {
    if (state.opcode === "get") {
      state.result = state.range ? pluck("val")(res) : res.val
    } else if (state.opcode === "getInputs") {
      state.json = state.range ? pluck("val")(res) : res.val
    }
  }
  return arguments[0]
}

const reader = {
  get: pka().map(getDocs),
  cget: pka().map(getDocs),
  getInputs: pka().map(getDocs).map(getInputs),
}

const toResult = ({ state }) => state.result

function read({ state }) {
  return pof(arguments[0]).chain(reader[state.opcode].fn()).to(toResult)
}

export default read
