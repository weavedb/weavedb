import kv from "./kv.js"

const kv_sql = (io, sql, fn) => {
  const methods = { sql: q => sql.prepare(q).all() }
  return kv(io, fn, null, methods)
}
export default kv_sql
