import { HyperBEAM } from "wao/test"
import validate from "../hb/src/validate.js"
import { resolve } from "path"
import yargs from "yargs"
import { readFileSync } from "fs"
import { HB } from "wao"
let {
  pid,
  vid,
  hb = `http://localhost:10001`,
  wallet = "HyperBEAM/.wallet.json",
  db = ".db/validator",
} = yargs(process.argv.slice(2)).argv

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
    await validate(opt)
  } catch (e) {
    console.log(e)
  }
  setTimeout(() => check(opt), 10000)
}
const main = async () => {
  const dbpath = resolve(process.cwd(), db, pid)
  const jwk = JSON.parse(readFileSync(resolve(process.cwd(), wallet), "utf8"))
  const _hb = new HB({ jwk, url: hb })
  if (!vid) {
    const { pid: _vid } = await _hb.spawn({
      "execution-device": "weavedb@1.0",
      db: pid,
    })
    vid = _vid
  }
  const opt = { pid, hb, dbpath, jwk, validate_pid: vid }
  console.log(`vid: ${vid}`)
  check(opt)
}

main()
