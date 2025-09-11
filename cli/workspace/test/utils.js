import assert from "assert"
import { acc } from "wao/test"
import { DB } from "wdb-sdk"
import { mem } from "wdb-core"

import schema from "../db/schema.js"
import rules from "../db/rules.js"
import indexes from "../db/indexes.js"
import triggers from "../db/triggers.js"

const owner = acc[0]

const init = async () => {
  const { q } = mem()
  const db = new DB({ jwk: owner.jwk, hb: null, mem: q })
  const id = await db.init({ id: "wdb" })
  for (const name in schema) {
    await db.mkdir({ name, schema: schema[name], auth: rules[name] })
  }
  for (const k in indexes) for (const i of indexes[k]) await db.addIndex(i, k)
  for (const k in triggers) {
    for (const t of triggers[k]) console.log(await db.addTrigger(t, k))
  }
  return { db, id, q }
}

export { init }
