import yargs from "yargs"
import { resolve } from "path"
import { readFileSync } from "fs"
let { url, pid } = yargs(process.argv.slice(2)).argv

const main = async () => {
  const { wal } = await fetch(`${url}/wal/${pid}`).then(r => r.json())
  console.log(wal.length)
  for (const v of wal) {
    console.log(v, v.value.opt.headers?.nonce, v.value.opt.headers?.query)
  }
}
main()
