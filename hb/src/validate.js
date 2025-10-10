import { DatabaseSync } from "node:sqlite"
import { HB } from "wao"
import * as lancedb from "@lancedb/lancedb"
import Sync from "./sync.js"
import zlib from "zlib"
import { promisify } from "util"
const brotliCompress = promisify(zlib.brotliCompress)
const brotliDecompress = promisify(zlib.brotliDecompress)
//import { kv, db as wdb, vec, sql } from "wdb-core"
import { kv, db as wdb, vec, sql } from "../../core/src/index.js"
import { getMsgs } from "./server-utils.js"
import { isEmpty, sortBy, prop, isNil, keys, pluck, clone } from "ramda"
import { json, encode, Encoder } from "arjson"
import { DB as ZKDB } from "zkjson"
import { resolve } from "path"
import { connect, createSigner } from "@permaweb/aoconnect"

let io = null
let request = null
let v_pid = null
const to64 = hash => {
  const n = BigInt(hash)
  let hex = n.toString(16)
  if (hex.length % 2) hex = "0" + hex
  const buf = Buffer.from(hex, "hex")
  return buf.toString("base64")
}
const from64 = b64 => {
  const buf = Buffer.from(b64, "base64")
  const hex = buf.toString("hex")
  const n = BigInt("0x" + hex)
  return n.toString()
}

let zkdb = null
let cols = {}
let ongoing = false

const calcZKHash = async changes => {
  if (!zkdb) {
    // upgrade to db2
    zkdb = new ZKDB({
      wasm: resolve(import.meta.dirname, "circom/db/index_js/index.wasm"),
      zkey: resolve(import.meta.dirname, "circom/db/index_0001.zkey"),
    })
    await zkdb.init()
  }
  for (const v of changes) {
    const [dir, doc] = v.key.split("/")
    if (dir === "_" && isNil(cols[doc]) && !isNil(v.data?.index)) {
      cols[doc] = v.data.index
      await zkdb.addCollection(v.data.index)
    }
    try {
      await zkdb.insert(cols[dir], doc, v.data)
      console.log("added to zk tree", dir, doc)
    } catch (e) {
      console.log("zk error:", JSON.stringify(v.data).length, v.data)
      console.log(e)
    }
  }
  return to64(zkdb.tree.F.toObject(zkdb.tree.root).toString())
}

const schedule = async (request, obj, attempts = 0) => {
  let res
  let err = false
  try {
    // decode_error <= hbsig parse error?
    res = await request.message(obj)
    const decode = JSON.parse(res.res?.results?.data).decode
    if (decode === false) return { err: true, res }
    if (decode !== true) throw Error("decode not found")
  } catch (e) {
    console.log("error:", attempts, e?.toString())
    err = true
  }
  return err
    ? attempts > 5
      ? { err: true, res }
      : await schedule(request, obj, attempts + 1)
    : { erro: false, res }
}

const buildBundle = async (changes, request, vid, cslot) => {
  let _changes = []
  for (const k in changes) {
    _changes.push({ key: k, delta: changes[k].delta, data: changes[k].to })
  }
  _changes = sortBy(prop("key"), _changes)
  let header = []
  let bytes = []
  let i = 0
  for (const v of _changes) {
    header.push([v.key, v.delta[0] + 1, v.delta[1].length])
    bytes.push(v.delta[1])
    i++
  }
  let u = new Encoder(2)
  const enc = encode(header, u)
  bytes.unshift(enc)
  const totalLen = bytes.reduce((sum, arr) => sum + arr.length, 0)
  const buf = Buffer.alloc(totalLen)
  let offset = 0
  for (const arr of bytes) {
    buf.set(arr, offset)
    offset += arr.length
  }
  const zkhash = await calcZKHash(_changes)
  //console.log(buf.toString("base64"))
  const params = {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11, // Maximum quality
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_GENERIC,
    [zlib.constants.BROTLI_PARAM_LGWIN]: 24, // Maximum window size (16MB)
    [zlib.constants.BROTLI_PARAM_LGBLOCK]: 24, // Maximum block size
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
  }
  const compressed = await brotliCompress(buf, params)
  const { err, res } = await schedule(request, {
    pid: vid,
    tags: {
      zkhash,
      Action: "Commit",
      "Data-Protocol": "ao",
      Variant: "ao.TN.1",
    },
    data: compressed,
  })
  if (err) console.log("this is stuck....")
  console.log()
  console.log(
    `[${cslot}] ${res?.pid} <zkhash: ${zkhash}> : ${buf.length} bytes`,
  )
  return { buf, zkhash }
}

const getKV = obj => {
  return kv(obj.io, async c => {
    let changes = {}
    let slot = null
    for (const d of c.data) {
      slot = d.opt.slot
      for (const k in d.cl) {
        let dir = false
        if (k.split("/")[0] === "_") {
          dir = true
          const clk = clone(d.cl[k])
          for (let k in obj) if (/^__/.test(k)) delete obj[k]
          // sql requires schema to recover and process zkp
          if (
            obj.type === "sql" &&
            !/^_/.test(k.split("/")[1]) &&
            d.cl[k].schema
          ) {
            clk.schema = d.cl[k].schema
          }
          d.cl[k] = clk
        }
        if (true /*|| dir || !/^_/.test(k.split("/")[0])*/) {
          let delta = null
          if (!obj.deltas[k]) {
            let cache = obj.io.get(`__deltas__/${k}`)
            if (cache) {
              for (let v of cache) v[1] = Uint8Array.from(v[1])
              obj.deltas[k] = json(cache, undefined, 2)
            } else {
              obj.deltas[k] = json(null, d.cl[k], 2)
              delta = obj.deltas[k].deltas()[0]
              await obj.io.put(`__deltas__/${k}`, obj.deltas[k].deltas())
            }
          } else {
            delta = obj.deltas[k].update(d.cl[k])
            await obj.io.put(`__deltas__/${k}`, obj.deltas[k].deltas())
          }
          if (delta && delta[1].length > 0) {
            changes[k] = { from: c.old[k], to: d.cl[k], delta }
          }
        }
      }
    }
    obj.ch++
    await obj.io.put(`__ch__`, obj.ch)
    await obj.io.put(`__changes__/${obj.ch}`, changes)
  })
}

export class Validator extends Sync {
  constructor({
    pid,
    jwk,
    dbpath,
    vid,
    hb = "http://localhost:10001",
    type = "nosql",
    format = "ans104",
    max_msgs = 20,
    limit = 20,
    autosync,
  }) {
    dbpath = `${dbpath}/${pid}/${vid}`
    const onslot = async m => {
      if (m.body.data) {
        for (const v of JSON.parse(m.body.data)) {
          await this.io.put(`__wmsg__/${v.slot}`, v)
        }
      }
    }
    super({ pid, dbpath, vid, hb, limit, dbpath, autosync, onslot })
    this.dbpath = dbpath
    this.max_msgs = max_msgs
    this.wslot = this.io.get("__wslot__") ?? -1
    this.cslot = this.io.get("__cslot__") ?? -1
    this.ch = this.io.get("__ch__") ?? -1
    this.type = type
    this.hb = hb
    this.format = format
    this.jwk = jwk
    this.request = new HB({ url: this.hb, jwk: this.jwk, format: this.format })
  }
  async init() {
    await super.init()
    this.wkv = getKV(this)
    if (this.type === "vec") {
      const _vec = await lancedb.connect(`${this.dbpath}-${this.pid}.vec`)
      this.db = await vec(this.wkv, { no_commit: true, sql: _vec }) // ??
    } else if (this.type === "sql") {
      const _sql = new DatabaseSync(`${this.dbpath}.sql`)
      this.db = sql(this.wkv, { no_commit: true, sql: _sql })
    } else this.db = wdb(this.wkv, { no_commit: true })
    this.isInitDB = true
    return this
  }
  async write(force = false) {
    return new Promise(async res => {
      if (!this.isInitDB) return console.log("not initialized yet...")
      if (this.ongoing_write && force !== true)
        return console.log("getMsgs ongoing...")
      this.ongoing_write = true
      let isData = false
      let i = 0
      try {
        let msg = this.io.get(`__wmsg__/${this.wslot + 1}`) ?? null
        while (msg && i < this.max_msgs) {
          console.log(`${msg.slot}: ${msg.headers?.query}`)
          if (this.type === "vec") await this.db.pwrite(msg)
          else this.db.write(msg)
          isData = true
          this.wslot += 1
          await this.io.put("__wslot__", this.wslot)
          msg = this.io.get(`__wmsg__/${this.wslot + 1}`) ?? null
          i++
        }
      } catch (e) {
        console.log(e)
      }
      if (isData) {
        await this.wkv.commit({ delta: true, slot: this.wslot }, async () => {
          if (i >= this.max_msgs) res(await this.write(true))
          else {
            this.ongoing_write = false
            res(this.wslot)
          }
        })
      } else {
        this.ongoing_write = false
        res(this.wslot)
      }
    })
  }
  async commit() {
    if (!this.isInitDB) return console.log("not initialized yet...")
    if (this.ongoing_commit) return console.log("getMsgs ongoing...")
    this.ongoing_commit = true
    let hashes = {}
    try {
      let changes = this.io.get(`__changes__/${this.cslot + 1}`) ?? null
      while (changes) {
        const { buf, zkhash } = await buildBundle(
          changes,
          this.request,
          this.vid,
          this.cslot + 1,
        )
        await this.io.put("__bundle__", { zkhash, buf })
        hashes[this.cslot + 1] = { zkhash, size: buf.length }
        this.cslot += 1
        await this.io.put("__cslot__", this.cslot)
        changes = this.io.get(`__changes__/${this.cslot + 1}`) ?? null
      }
    } catch (e) {
      console.log(e)
    }
    this.ongoing_commit = false
    return hashes
  }
}
