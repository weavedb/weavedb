import { HyperBEAM, wait } from "wao/test"
import { Validator } from "../hb/src/validate.js"
import { resolve } from "path"
import yargs from "yargs"
import { readFileSync } from "fs"
import { HB } from "wao"
import { toAddr } from "wao/utils"
let {
  pid,
  vid,
  hb = `http://localhost:10001`,
  wallet = "HyperBEAM/.wallet.json",
  db = ".db/validator",
} = yargs(process.argv.slice(2)).argv

const get = async val => {
  try {
    console.log("get:", await val.get())
  } catch (e) {
    console.log(e)
  }
  setTimeout(() => get(val), 10000)
}
const write = async val => {
  try {
    console.log("write:", await val.write())
  } catch (e) {
    console.log(e)
  }
  setTimeout(() => write(val), 10000)
}
const commit = async val => {
  try {
    console.log("commit:", await val.commit())
  } catch (e) {
    console.log(e)
  }
  setTimeout(() => commit(val), 10000)
}

const validateDB = async ({ hbeam, pid, hb, jwk }) => {
  const getVal = () =>
    new Promise(async res => {
      const { pid: validate_pid } = await hbeam.spawn({
        "Data-Protocol": "ao",
        Variant: "ao.TN.1",
        "execution-device": "weavedb@1.0",
        db: pid,
      })
      res(validate_pid)
    })
  let vid = null
  let attempt = 0
  while (!vid && attempt < 5) {
    vid = await getVal()
    attempt += 1
    await wait(3000)
  }
  return { validate_pid: vid }
}

const main = async () => {
  console.log(`pid: ${pid}`)
  const jwk = JSON.parse(readFileSync(resolve(process.cwd(), wallet), "utf8"))
  console.log(toAddr(jwk.n))
  const _hb = new HB({ jwk, url: hb, format: "ans104" })
  if (!vid) {
    const { pid: _vid } = await _hb.spawn({
      "data-protocol": "ao",
      variant: "ao.TN.1",
      "execution-device": "weavedb@1.0",
      db: pid,
    })
    vid = _vid
  }
  const dbpath = resolve(process.cwd(), db)
  console.log(`dbpath: ${dbpath}`)
  const opt = { pid, hb, dbpath, jwk, validate_pid: vid }
  console.log(`vid: ${vid}`)

  const val = await new Validator({ jwk, pid, dbpath, vid, hb }).init()
  get(val)
  write(val)
  commit(val)
}

main()
