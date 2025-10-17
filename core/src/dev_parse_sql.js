import { of } from "monade"
import sql_parser from "node-sql-parser"
const _parser = new sql_parser.Parser()

const parser = {}

function parse({ state, env }) {
  state.query.shift()
  const { kv } = env
  let data, dir, doc
  if (state.opcode === "init") {
  } else if (state.opcode === "sql") {
    try {
      state.ast = _parser.astify(state.query[0], { database: "sqlite" })
    } catch (e) {
      throw Error("invalid sql")
    }
  }
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
  if (parser[state.opcode]) of(arguments[0]).chain(parser[state.opcode].k)
  return arguments[0]
}
export default parse
