import server from "../hb/src/server.js"
import { resolve } from "path"
import yargs from "yargs"
import { readFileSync } from "fs"
let {
  port = 6363,
  hb = 10001,
  db = ".db",
  wallet = "HyperBEAM/.wallet.json",
} = yargs(process.argv.slice(2)).argv

const main = async () => {
  const dbpath = resolve(process.cwd(), db)
  const jwk = JSON.parse(readFileSync(resolve(process.cwd(), wallet), "utf8"))
  const node = await server({ dbpath, jwk, hb: `http://localhost:${hb}`, port })
}

main()
