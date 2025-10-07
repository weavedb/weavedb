import { HyperBEAM, wait } from "wao/test"
import cu from "../hb/src/cu.js"
import { resolve } from "path"
import yargs from "yargs"
import { readFileSync } from "fs"
import { HB } from "wao"
import { toAddr } from "wao/utils"
let {
  hb = `http://localhost:10001`,
  wallet = "HyperBEAM/.wallet.json",
  db = ".db/validator",
} = yargs(process.argv.slice(2)).argv

const main = async () => {
  const jwk = JSON.parse(readFileSync(resolve(process.cwd(), wallet), "utf8"))
  console.log(toAddr(jwk.n))
  const dbpath = resolve(process.cwd(), db)
  console.log(`dbpath: ${dbpath}`)
  const { server } = await cu({ jwk, dbpath, hb })
}

main()
