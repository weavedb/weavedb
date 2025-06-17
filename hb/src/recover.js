import wdb from "./index.js"
import { getKV2, getKV, getMsgs } from "./server-utils.js"
import { isEmpty } from "ramda"
import { open } from "lmdb"

const recover = async ({ pid, jwk, dbpath, hb }) => {
  let i = 0
  let db = null
  let from = 0
  let to = 99
  let res = await getMsgs({ pid, hb })
  const io = open({ path: `${dbpath}/${pid}` })
  let height = io.get("__wal__/height")
  console.log(`recover: ${pid}, height: ${height}`)
  db = wdb(getKV2({ jwk, hb, dbpath, pid }))
  while (!isEmpty(res.assignments)) {
    for (let k in res.assignments ?? {}) {
      const m = res.assignments[k]
      if (m.slot === 0) {
        let from = null
        for (const k in m.body.commitments) {
          const c = m.body.commitments[k]
          if (c.committer) {
            from = c.committer
            break
          }
        }
        console.log("initializing...", pid)
      }
      if (m.body.data) {
        for (const v of JSON.parse(m.body.data)) {
          try {
            if (i >= height) {
              db.write(v)
            } else {
              console.log("exists", i, "<", height)
            }
          } catch (e) {
            console.log(e)
          }
          i++
        }
      }
    }
    from += 100
    to += 100
    res = await getMsgs({ pid, hb, from, to })
  }
  return db
}

export default recover
