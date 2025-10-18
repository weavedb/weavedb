import { pof, pka } from "monade"
import { map, pluck, isNil, pick } from "ramda"
import parseQuery from "./parser.js"
import { get } from "./planner.js"
import DBTree from "zkjson/smt"

export default async function get_zip_inputs({ state, env }) {
  const { kv } = env
  const parsed = parseQuery(state.query)
  const res = get(parsed, env.kv_dir)
  state.json = state.range ? pluck("val")(res) : res.val
  const { dirinfo, doc, data, json } = state
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
