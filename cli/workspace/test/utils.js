import assert from "assert"
import { acc } from "wao/test"
import { DB } from "wdb-sdk"
import { mem } from "wdb-core"

import schemas from "../db/schemas.js"
import auth from "../db/auth.js"
import indexes from "../db/indexes.js"
import triggers from "../db/triggers.js"

const owner = acc[0]

const init = async () => {
  const { q } = mem()
  const db = new DB({ jwk: owner.jwk, hb: null, mem: q })
  const id = await db.init({ id: "wdb" })
  let err = null
  for (const name in schemas) {
    const { success, error } = await db.mkdir({
      name,
      schema: schemas[name],
      auth: auth[name],
    })
    if (!success) {
      err = error
      break
    }
  }
  if (!err) {
    for (const k in indexes)
      for (const i of indexes[k]) {
        const { success, error } = await db.addIndex(i, k)
        if (!success) {
          err = error
          break
        }
        if (err) break
      }
  }
  if (!err) {
    for (const k in triggers) {
      for (const t of triggers[k]) {
        const { success, error } = await db.addTrigger(t, k)
        if (!success) {
          err = error
          break
        }
      }
      if (err) break
    }
  }
  return { db, id, q, err }
}

export { init }
