import { HyperBEAM } from "wao/test"
import BD from "../hb/src/bundler.js"
import { resolve } from "path"
import yargs from "yargs"
import { readFileSync } from "fs"
import { HB } from "wao"
import { toAddr } from "wao/utils"
let {
  port = 4001,
  wallet = "HyperBEAM/.wallet.json",
  dbpath = ".db",
} = yargs(process.argv.slice(2)).argv

const main = async () => {
  const jwk = JSON.parse(readFileSync(resolve(process.cwd(), wallet), "utf8"))
  const _dbpath = resolve(process.cwd(), dbpath, "bundler")
  console.log("signer:", toAddr(jwk.n))
  const su = BD({ port, jwk, dbpath: _dbpath })
}

main()
