import { HyperBEAM, wait } from "wao/test"
import { Validator } from "../hb/src/validate.js"
import validator from "../hb/src/validator.js"
import { resolve } from "path"
import yargs from "yargs"
import { readFileSync } from "fs"
import { HB } from "wao"
import { toAddr } from "wao/utils"
let {
  port = 6367,
  hb = `http://localhost:10001`,
  wallet = "HyperBEAM/.wallet.json",
  db = ".db/validator",
} = yargs(process.argv.slice(2)).argv

const main = async () => {
  const jwk = JSON.parse(readFileSync(resolve(process.cwd(), wallet), "utf8"))
  console.log("Validator Address:", toAddr(jwk.n))
  const dbpath = resolve(process.cwd(), db)
  const node = validator({ jwk, dbpath, port })
}

main()
