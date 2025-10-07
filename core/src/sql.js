import normalize from "./dev_normalize.js"
import verify from "./dev_verify.js"
import write from "./dev_write_sql.js"
import parse from "./dev_parse_sql.js"
import build from "./build.js"
import kv from "./kv_nosql.js"

function sql({ msg, env: { sql } }) {
  return sql.prepare(msg[0]).all()
}

export default build({
  kv,
  write: [normalize, verify, parse, write],
  __read__: { sql: [sql] },
})
