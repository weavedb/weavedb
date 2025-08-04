import { HyperBEAM } from "wao/test"
import validate from "../hb/src/validate.js"
import { resolve } from "path"
import yargs from "yargs"
import { readFileSync } from "fs"
import { HB } from "wao"
import zkjson from "../hb/src/zkjson.js"
let {
  vid,
  port = 6365,
  hb = `http://localhost:10001`,
  db = ".db/zk",
  commit,
  alchemy_key,
  priv_key,
} = yargs(process.argv.slice(2)).string("commit").argv
let zkp = null
const query = async (hb, ...q) => {
  return (
    (
      await hb.message({
        pid: vid,
        tags: { Action: "Query", Query: JSON.stringify(q) },
      })
    ).res?.results?.data ?? null
  )
}
const check = async opt => {
  try {
    await zkjson({ ...opt, port })
  } catch (e) {
    console.log(e)
  }
  setTimeout(() => check(opt), 10000)
}
const main = async () => {
  const dbpath = resolve(process.cwd(), db, "db", vid)
  const dbpath_hb = resolve(process.cwd(), db, "wal", vid)
  console.log(`dbpath: ${dbpath}`)
  const opt = {
    pid: vid,
    hb,
    dbpath,
    dbpath_hb,
    commit,
    alchemy_key,
    priv_key,
  }
  console.log(`vid: ${vid}`)
  check(opt)
}

main()
