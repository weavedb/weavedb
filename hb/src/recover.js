import wdb from "./index.js"
import { getKV, getMsgs } from "./server-utils.js"
import { isEmpty } from "ramda"

const recover = async ({ pid, jwk, dbpath, hb }) => {
  let i = 0
  let db = null
  let from = 0
  let to = 99
  let res = await getMsgs({ pid, hb })
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
        db = wdb(getKV({ jwk, hb, dbpath, pid }))
      }
      if (m.body.data) {
        for (const v of JSON.parse(m.body.data)) {
          try {
            db.write(v)
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
