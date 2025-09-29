import { HyperBEAM } from "wao/test"
import SU from "../hb/src/su.js"
import { resolve } from "path"
import yargs from "yargs"
import { readFileSync } from "fs"
import { HB } from "wao"
import { toAddr } from "wao/utils"
let {
  port = 4003,
  hb = `http://localhost:10001`,
  db = "http://localhost:6364",
  mu = "https://mu.ao-testnet.xyz",
  wallet = "HyperBEAM/.wallet.json",
  bundler = null,
  dbpath = ".db",
} = yargs(process.argv.slice(2)).argv

const main = async () => {
  const jwk = JSON.parse(readFileSync(resolve(process.cwd(), wallet), "utf8"))
  const _dbpath = resolve(process.cwd(), dbpath, "su")
  console.log("signer:", toAddr(jwk.n))
  const su = new SU({ port, jwk, db, hb, mu, bundler, dbpath: _dbpath })
}

main()
