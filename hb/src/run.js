import yargs from "yargs"
import { resolve } from "path"
import { readFileSync } from "fs"
import server from "./server.js"

let {
  port = 4000,
  db = ".cache",
  hb = "http://localhost:10000",
  wallet = ".wallet.json",
} = yargs(process.argv.slice(2)).argv

const run = async () => {
  const dbpath = resolve(import.meta.dirname, `.db/${db}`)
  const jwk = JSON.parse(
    readFileSync(resolve(import.meta.dirname, `${wallet}`), "utf8"),
  )
  const node = await server({ dbpath, jwk, hb })
}

run()
