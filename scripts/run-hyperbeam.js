import { HyperBEAM } from "wao/test"
import { resolve } from "path"
import yargs from "yargs"
let {
  c,
  cmake,
  dir = "./HyperBEAM",
  gateway = 4000,
  wallet,
} = yargs(process.argv.slice(2)).argv

const main = () => {
  let opt = {
    cwd: resolve(process.cwd(), dir),
    gateway,
  }
  if (c) opt.c = c
  if (cmake) opt.cmake = cmake
  if (wallet) opt.wallet = resolve(process.cwd(), wallet)
  const hb = new HyperBEAM(opt)
}

main()
