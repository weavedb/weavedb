import yargs from "yargs"
import { resolve } from "path"
import { readFileSync, writeFileSync } from "fs"
import { toAddr } from "wao/utils"
import { DB } from "wdb-sdk"
import schema from "../db/schema.js"
import rules from "../db/rules.js"
import indexes from "../db/indexes.js"
import triggers from "../db/triggers.js"

const {
  wallet,
  hb = "http://localhost:10001",
  db: url = "http://localhost:6364",
} = yargs(process.argv.slice(2)).argv
let jwk = null
try {
  jwk = JSON.parse(readFileSync(resolve(process.cwd(), wallet), "utf8"))
} catch (e) {
  console.log("the wrong wallet location")
  process.exit()
}

const main = async () => {
  console.log(`HyperBEAM: ${hb}`)
  console.log(`DB Rollup: ${url}`)
  console.log(`Wallet: ${toAddr(jwk.n)}`)
  const db = new DB({ jwk, hb, url })
  const id = await db.spawn()
  console.log(`DB deployed: ${id}`)
  for (const name in schema) {
    const res = await db.mkdir({
      name,
      schema: schema[name],
      auth: rules[name],
    })
    if (res.success) console.log(`Dir created: ${name}`)
    else {
      console.log(res.error)
      process.exit()
    }
  }
  for (const k in indexes)
    for (const i of indexes[k]) {
      const res = await db.addIndex(i, k)
      if (res.success) console.log(`Index added: ${k} => ${JSON.stringify(i)}`)
      else {
        console.log(res.error)
        process.exit()
      }
    }
  for (const k in triggers) {
    for (const t of triggers[k]) {
      const res = await db.addTrigger(t, k)
      if (res.success) console.log(`Trigger added: ${k} => ${t.key}`)
      else {
        console.log(res.error)
        process.exit()
      }
    }
  }
}

main()
