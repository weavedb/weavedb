import kv from "./kv.js"
import mem from "./mem.js"
import queue from "./queue.js"
import wdb from "./db.js"

import zlib from "zlib"
import { readFileSync, writeFileSync } from "fs"
import { resolve, join } from "path"
const modules = { "0.1.0": "0.1.0", "0.1.1": "0.1.1" }
const _fetchFile = async ver => {
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

const _fetch = async (gateway, ver) => {
  console.log("fetching...", ver, modules[ver])
  const bin = Buffer.from(
    await fetch(`${gateway}/${modules[ver]}`).then(r => r.arrayBuffer()),
  )
  const src = zlib.brotliDecompressSync(bin).toString()
  const { tmpdir } = await import("os")
  const { pathToFileURL } = await import("url")
  const tempFile = join(tmpdir(), `wdb-${Date.now()}.mjs`)
  writeFileSync(tempFile, src)
  const { default: db } = await import(pathToFileURL(tempFile).href)
  return db
}

export default class Core {
  constructor({ io, gateway = "https://arweave.net", kv: _kv }) {
    this.gateway = gateway
    this.io = io
    this.kv = _kv
    if (this.io && !this.kv) this.kv = kv(this.io, async c => {})
  }
  async init({ version, env = {} }) {
    this.env = env
    this.wdb = wdb
    if (version) {
      try {
        const db = await _fetch(this.gateway, version)
        this._db = this.kv ? queue(db(this.kv, env)) : mem().q
      } catch (e) {}
    } else this._db = this.kv ? queue(this.wdb(this.kv, env)) : mem().q

    this.db = {}
    for (const k in this._db) {
      this.db[k] = async (...q) => {
        const res = await this._db[k](...q)
        if (res.success && res.res.opcode === "revert") {
          console.log("reverting...........................")
          this._db = this.old_db
          delete this.old_db
        } else if (res.success && res.res.opcode === "upgrade") {
          this.upgrading = res.res.data
          console.log(
            "upgrading to ...........................",
            this.upgrading,
          )
          try {
            const db = await _fetch(this.gateway, this.upgrading)
            this.old_db = this._db
            this._db = this.kv ? queue(db(this.kv, env)) : mem().q
            this.upgrading = false
          } catch (e) {
            this.upgrading_error = true
          }
        }
        return res
      }
    }
    return this
  }
}
