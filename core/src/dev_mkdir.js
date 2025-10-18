import { of } from "monade"
import setSchema from "./dev_set_schema.js"
export default function mkdir({ state, env: { kv, info } }) {
  const { dir } = state
  const dirinfo = kv.get("_", dir)
  if (dirinfo) throw Error("dir exists:", dir)
  const dirid = info.dirs
  const _dirinfo = { index: dirid }
  info.dirs = dirid + 1
  kv.put("_", dir, _dirinfo)
  kv.put("_config", "info", info)
  return arguments[0]
}
