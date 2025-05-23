import kv from "./kv.js"

const kv_sql = (io, sql, fn) => {
  const sync = async msg => {
    try {
      const [op, query] = JSON.parse(msg.headers.query)
      if (op === "sql") sql.exec(query)
    } catch (e) {
      console.log(e)
    }
  }
  const methods = { sql: q => sql.prepare(q).all() }
  return kv(io, fn, sync, methods)
}
export default kv_sql
