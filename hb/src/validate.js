import wdb from "./index.js"
import { getMsgs } from "./server-utils.js"
import { isEmpty } from "ramda"

import kv from "./kv.js"
import { open } from "lmdb"

const getKV = ({ jwk, pid, hb, dbpath }) => {
  const io = open({ path: dbpath })
  let addr = null
  return kv(io, async c => {
    let changes = {}
    for (const d of c.data) {
      for (const k in d.cl) {
        if (k.split("/")[0] !== "__indexes__")
          changes[k] = { from: c.old[k], to: d.cl[k] }
      }
    }
    console.log(changes)
  })
}

const validate = async ({ pid, jwk, dbpath, hb }) => {
  let i = 0
  let db = null
  let from = 0
  let to = 99
  let res = await getMsgs({ pid, hb })
  const wkv = getKV({ jwk, hb, dbpath, pid })
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
        db = wdb(wkv, { no_commit: true }).init({ from, id: pid })
      }
      if (m.body.data) {
        for (const v of JSON.parse(m.body.data)) {
          const q = JSON.parse(v.query)
          db.set(...q, {
            slot: m.slot,
            nonce: v.nonce,
            signature: v.signature,
            "signature-input": v["signature-input"],
          })
          i++
        }
      }
    }
    from += 100
    to += 100
    res = await getMsgs({ pid, hb, from, to })
  }
  wkv.commit({ delta: true })
  return db
}

export default validate
