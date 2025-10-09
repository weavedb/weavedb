import kv from "./kv.js"
import mem from "./mem.js"
import queue from "./queue.js"
import wdb from "./db.js"
import zlib from "zlib"
import { readFileSync, writeFileSync } from "fs"
import { resolve, join } from "path"

const _fetch = async ver => {
  console.log("fetching...", ver)
  const bin = readFileSync(
    resolve(import.meta.dirname, `../build/wdb.${ver}.min.js.br`),
  )
  const src = zlib.brotliDecompressSync(bin).toString()
  const { tmpdir } = await import("os")
  const { pathToFileURL } = await import("url")
  const tempFile = join(tmpdir(), `wdb-${Date.now()}.mjs`)
  writeFileSync(tempFile, src)
  const { default: db } = await import(pathToFileURL(tempFile).href)
  if (ver === "0.1.1") return wdb
  return db
}
const versions = {}
export default class Core {
  constructor({ io, gateway = "https://arweave.net" }) {
    this.gateway = gateway
    this.io = io
    if (this.io) this.kv = kv(this.io, async c => {})
    versions["v0_1_0"] = readFileSync(
      resolve(import.meta.dirname, "../build/wdb.0.1.0.min.js.br"),
    )
  }
  async init({ version, env = {} }) {
    this.env = env
    if (version) {
      try {
        const db = await _fetch(version)
        this._db = this.kv ? queue(db(this.kv, env)) : mem().q
      } catch (e) {}
    } else {
      this._db = this.kv ? queue(wdb(this.kv, env)) : mem().q
    }
    this.db = {
      sql: (...q) => this._db.sql(...q),
      get: (...q) => this._db.get(...q),
      cget: (...q) => this._db.cget(...q),
      read: (...q) => this._db.read(...q),
      write: async (...q) => {
        const res = await this._db.write(...q)
        if (res.success && res.result.opcode === "revert") {
          console.log("reverting...........................")
          this._db = this.old_db
          delete this.old_db
        } else if (res.success && res.result.opcode === "upgrade") {
          this.upgrading = res.result.data
          console.log(
            "upgrading to ...........................",
            this.upgrading,
          )
          try {
            const db = await _fetch(this.upgrading)
            this.old_db = this._db
            this._db = this.kv ? queue(db(this.kv, env)) : mem().q
            this.upgrading = false
          } catch (e) {
            this.upgrading_error = true
          }
        }
        return res
      },
    }
    return this
  }
}
