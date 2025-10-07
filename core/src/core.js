import kv from "./kv.js"
import mem from "./mem.js"
import queue from "./queue.js"
import db from "./db.js"
import zlib from "zlib"
import { readFileSync, writeFileSync } from "fs"
import { resolve, join } from "path"
import { promisify } from "util"
export default class Core {
  constructor({ io, gateway = "https://arweave.net" }) {
    this.gateway = gateway
    this.io = io
    if (this.io) this.kv = kv(this.io, async c => {})
  }
  async init({ module, env = {} }) {
    this.db = db
    this.env = env
    if (module) {
      try {
        const bin = readFileSync(
          resolve(import.meta.dirname, "../wdb.min.js.br"),
        )
        const src = (await promisify(zlib.brotliDecompress)(bin)).toString()
        const { tmpdir } = await import("os")
        const { pathToFileURL } = await import("url")
        const tempFile = join(tmpdir(), `wdb-${Date.now()}.mjs`)
        writeFileSync(tempFile, src)
        const { default: db } = await import(pathToFileURL(tempFile).href)
      } catch (e) {}
    }
    this.db = this.kv ? queue(this.db(this.kv, env)) : (this.db = mem().q)
    return this
  }
}
