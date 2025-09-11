import wdb from "./db.js"
import io from "./io.js"
import kv from "./kv.js"
import queue from "./queue.js"

export default () => {
  const wkv = kv(io(), async c => {})
  const db = wdb(wkv)
  return { q: queue(db), db, kv: wkv, io: wkv.io }
}
