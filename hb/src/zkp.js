import { createHash } from "node:crypto"
const hex = buf => createHash("sha256").update(buf).digest("hex")
import Sync from "./sync.js"
import express from "express"
import { map, fromPairs } from "ramda"
const _tags = tags => fromPairs(map(v => [v.name, v.value])(tags))
import cors from "cors"
import bodyParser from "body-parser"
import { DB } from "wdb-sdk"
import { Core, kv, queue } from "wdb-core"
import { Prover } from "zkjson"
import { resolve } from "path"

let dbs = {}
let app = null
let server = null
let result = null

const startServer = ({ port, jwk }) => {
  app = express()
  app.use(cors())
  app.use(bodyParser.json())
  app.get("/zkp", async (req, res) => {
    const pid = req.query["pid"]
    const info = dbs[pid].io.get("_config/info")
    let proof = null
    let zkhash = null
    try {
      const db = new DB({ id: info.id, jwk })
      const {
        id,
        nonce,
        req: msg,
      } = await db.sign({
        query: ["getInputs", { path: "name" }, "users", "A"],
      })
      const {
        res: { result },
      } = await dbs[pid].db.read(msg)
      zkhash = result.hash
      const prover = new Prover({
        wasm: resolve(import.meta.dirname, "./circom/db3/index_js/index.wasm"),
        zkey: resolve(import.meta.dirname, "./circom/db3/index_0001.zkey"),
      })
      proof = await prover.genProof(result.inputs)
    } catch (e) {
      console.log(e)
    }
    res.json({ proof, zkhash })
  })

  return app.listen(port, () => console.log(`ZK Prover on port ${port}`))
}

export default async ({
  dbpath,
  hb = "http://localhost:10001",
  gateway = "https://arweave.net",
  sql,
  port = 6365,
  jwk,
  n = 4,
}) => {
  const add = async (pid, autowrite) => {
    if (!dbs[pid]) {
      const cu = await new ZKP({
        gateway,
        jwk,
        autowrite,
        hb,
        autosync: 3000,
        pid,
        limit: 10,
        dbpath,
        sql,
        n,
      }).init()
      dbs[pid] = cu
    }
    return dbs[pid]
  }
  result = async (pid, slot, cb) => (await add(pid, 3000)).result(slot, cb)
  if (port && !server) server = startServer({ port, jwk })
  return { server, add }
}

export class ZKP extends Sync {
  constructor({
    pid,
    dbpath,
    vid = "cu",
    hb = "http://localhost:10001",
    limit = 20,
    autosync,
    autowrite,
    jwk,
    sql,
    n = 2,
    gateway = "https://arweave.net",
  }) {
    dbpath = `${dbpath}/${pid}/${vid}`
    super({ pid, dbpath, vid, hb, limit, dbpath, autosync })
    this.gateway = gateway
    this.autowrite = autowrite
    this.dbpath = dbpath
    this.n = n
    this.jwk = jwk
    this.sql = sql
    this.schemas = {}
    this.indexes = {}
    this.subs = {}
  }

  async init() {
    await super.init()
    this.cols = this.io.get("__cols__") ?? {}
    this.wslot = this.io.get("__wslot__") ?? -1
    this.wkv = kv(this.io, async c => {})
    if (this.wslot >= 0) {
      //this.db = queue(db_sst(this.wkv))
      let info = this.io.get("__sst__/info")
      let version = info?.version
      let opt = { env: { branch: "sst" } }
      if (version) opt.version = version
      const core = await new Core({
        io: this.io,
        gateway: this.gateway,
        kv: this.wkv,
      }).init(opt)
      this.db = core.db
    }
    this.arjson = {}
    this.isInitDB = true
    if (this.autowrite) this.write()
    return this
  }

  async result(slot, cb) {
    const res = this.io.get([`__results__`, +slot])
    if (res) cb(res)
    else {
      this.next_write = true
      this.subs[slot] ??= []
      this.subs[slot].push(cb)
    }
  }

  async write(force = false) {
    return new Promise(async res => {
      if (!this.isInitDB) return console.log("not initialized yet...")
      if (this.ongoing_write && !force) return console.log("write ongoing...")
      this.ongoing_write = true
      let isData = false
      try {
        let m = this.io.get(`__msg__/${this.wslot + 1}`) ?? null
        if (m) {
          isData = true
          let _result = null
          if (m.slot === 0) {
            const version = m.body?.version
            let opt = { env: { branch: "sst" } }
            if (version) opt.version = version
            const core = await new Core({
              io: this.io,
              gateway: this.gateway,
              kv: this.wkv,
            }).init(opt)
            this.db = core.db
          }

          const { success, err, res } = await this.db.write(m.body)
          if (success === false) {
            _result = { success, err, res: null }
            if (m.body.action === "Commit") {
              if (/wrong nonce/.test(err)) {
                const regex = /correct:\s*(\d+)/
                const errorMessage = "Error: the wrong nonce: 3 (correct: 2)"
                const match = errorMessage.match(regex)
                let correct = null
                if (match) correct = +match[1]
                _result = { success, err, res: { nonce: false, correct } }
              } else _result = { success, err, res: { decode: false } }
            }
            await this.io.put(["__results__", m.slot], _result)
          } else if (success === true) {
            _result = { err: null, success: true, res: res?.result ?? null }
            await this.io.put(["__results__", m.slot], _result)
          }
          try {
            if (this.subs[m.slot] && _result) {
              for (const v of this.subs[m.slot]) {
                try {
                  v(_result)
                } catch (e) {}
              }
              delete this.subs[m.slot]
            }
          } catch (e) {}
          this.wslot += 1
          await this.io.put("__wslot__", this.wslot)
        }
      } catch (e) {
        console.log(e)
      }
      if (isData) {
        await this.write(true)
      } else {
        this.ongoing_write = false
        res(this.wslot)
        if (this.autowrite) {
          if (this.next_write !== true && this.stop_write) {
            this.stop_write = false
            delete this.autowrite
            if (typeof this.cb_write === "function") this.cb_write()
          } else setTimeout(() => this.write(), this.autowrite)
        } else if (this.next_write) {
          setTimeout(() => this.write(), this.next_write ? 0 : this.autowrite)
        }
        this.next_write = false
      }
    })
  }
  stopWrite(cb) {
    this.stop_write = true
    if (cb) this.cb_write = cb
    else return new Promise(res => (this.cb_write = res))
  }
  startWrite(to) {
    this.autowrite = to
    this.write()
  }
}
