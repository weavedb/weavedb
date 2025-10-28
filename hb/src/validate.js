import { DatabaseSync } from "node:sqlite"
import { HB } from "wao"
import { wait } from "wao/test"
import * as lancedb from "@lancedb/lancedb"
import Sync from "./sync.js"
import zlib from "zlib"
import { promisify } from "util"
const brotliCompress = promisify(zlib.brotliCompress)
import { Core, kv, db as wdb, vec, sql } from "wdb-core"
import { getMsgs } from "./server-utils.js"
import { isEmpty, sortBy, prop, isNil, keys, pluck, clone } from "ramda"
import { encode, Encoder, ARJSON, enc } from "arjson"
import { DBTree as ZKDB } from "zkjson"
import { readFileSync, writeFileSync } from "fs"

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
function estimateN(
  value,
  { k = 28, headroom = 1.2, min = 1, max = 2048 } = {},
) {
  const bytes = Buffer.byteLength(JSON.stringify(value), "utf8")
  const nRaw = Math.ceil(bytes / k)
  return Math.max(min, Math.min(max, Math.ceil(nRaw * headroom)))
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
let nonce = 2
let zkc = 0

const calcZKHash = async (changes, cols, zkdb, io) => {
  for (const v of changes) {
    const [dir, doc] = v.key.split("/")
    if (dir === "_" && isNil(cols[doc]) && !isNil(v.data?.index)) {
      cols[doc] = v.data.index
      await io.put("__zkp__", "cols", cols)
      await zkdb.addCollection(v.data.index)
      console.log(`[${zkc++}] collection added to zk tree`, doc, v.data.index)
    }
    try {
      if (isNil(v.data)) {
        await zkdb.delete(cols[dir], doc)
        console.log(`[${zkc++}] deleted from zk tree`, dir, doc)
      } else {
        await zkdb.insert(cols[dir], doc, v.data)
        console.log(`[${zkc++}] added to zk tree`, dir, doc)
      }
    } catch (e) {
      console.log("zk error:", JSON.stringify(v.data).length, dir, doc, v.data)
      console.log(e)
    }
  }
  return zkdb.hash()
}
const compute = async (request, pid, slot, obj, attempts = 0) => {
  console.log("timeout....", pid, slot)
  let res = null
  let timeout = false
  let err = false
  try {
    res = await request.compute({ pid, slot })
    const json = JSON.parse(res.results?.data)
    if (json.nonce === false) {
      if (json.correct) {
        nonce = json.correct
        obj.tags.nonce = nonce
      }
      throw Error("nonce error")
    }
    if (json.decode === false) return { err: true, res }
    if (json.decode !== true) throw Error("decode not found")
  } catch (e) {
    console.log(e, res)
    try {
      timeout = /timeout/.test(res.res.body.toString())
    } catch (e) {}
    console.log("error:", attempts, e?.toString())
    err = true
  }
  return err
    ? attempts > 5
      ? { err: true, res: { slot, pid, res } }
      : (await wait(timeout ? 10000 : 0),
        await compute(request, pid, slot, obj, attempts + 1))
    : { erro: false, res: { slot, pid, res } }
}

const schedule = async (request, obj, attempts = 0) => {
  let res = null
  let err = false
  let timeout = false
  let slot = null
  let pid = null
  try {
    // decode_error <= hbsig parse error?
    res = await request.message(obj)
    slot = res.slot
    pid = res.pid
    const json = JSON.parse(res.res?.results?.data)
    if (json.nonce === false) {
      if (json.correct) {
        nonce = json.correct
        obj.tags.nonce = nonce
      }
      throw Error("nonce error")
    }
    if (json.decode === false) return { err: true, res }
    if (json.decode !== true) throw Error("decode not found")
  } catch (e) {
    console.log(e, res)
    try {
      timeout = /timeout/.test(res.res.body.toString())
    } catch (e) {}
    console.log("error:", attempts, e?.toString())
    err = true
  }
  return err
    ? attempts > 5
      ? { err: true, res }
      : (await wait(timeout ? 10000 : 0),
        await compute(request, pid, slot, obj, attempts + 1))
    : { erro: false, res }
}

const buildBundle = async (changes, request, vid, cslot, cols, zkdb, io) => {
  let _changes = []
  for (const k in changes) {
    _changes.push({ key: k, deltas: changes[k].deltas, data: changes[k].to })
  }
  _changes = sortBy(prop("key"), _changes)
  let header = []
  let bytes = []
  for (const v of _changes) {
    header.push([v.key, v.deltas.length])
    bytes.push(ARJSON.toBuffer(v.deltas))
  }
  const _enc = enc(header)
  bytes.unshift(_enc)
  const totalLen = bytes.reduce((sum, arr) => sum + arr.length, 0)
  const buf = Buffer.alloc(totalLen)
  let offset = 0
  for (const arr of bytes) {
    buf.set(arr, offset)
    offset += arr.length
  }
  const zkhash = await calcZKHash(_changes, cols, zkdb, io)
  const params = {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11, // Maximum quality
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_GENERIC,
    [zlib.constants.BROTLI_PARAM_LGWIN]: 24, // Maximum window size (16MB)
    [zlib.constants.BROTLI_PARAM_LGBLOCK]: 24, // Maximum block size
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
  }
  const compressed = await brotliCompress(buf, params)
  const data = Buffer.concat([compressed, Buffer.alloc(1)])
  const { err, res } = await schedule(request, {
    pid: vid,
    tags: {
      nonce,
      zkhash,
      bytelen: compressed.length,
      Action: "Commit",
      "Data-Protocol": "ao",
      Variant: "ao.TN.1",
    },
    data,
  })
  if (err) {
    console.log("this is stuck....", err)
    process.exit()
  } else nonce += 1
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
        let cache = obj.io.get(`__deltas__/${k}`)
        let arj = null
        let deltas = null
        if (!cache) {
          arj = new ARJSON({ json: d.cl[k] })
          deltas = arj.deltas
        } else {
          arj = new ARJSON({ table: cache })
          deltas = arj.update(d.cl[k])
        }
        if (deltas && deltas.length > 0) {
          await obj.io.put(`__deltas__/${k}`, arj.artable.table())
          changes[k] = { to: d.cl[k], deltas }
        }
      }
    }
    obj.ch++
    await obj.io.put(`__ch__`, obj.ch)
    await obj.io.put(`__changes__/${obj.ch}`, changes)
    if (obj.resolve) {
      obj.resolve()
      obj.resolve = null
    }
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
    max_msgs = 100,
    limit = 20,
    autosync,
    gateway = "https://arweave.net",
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
    this.zkdb = this.deltas = {}
    this.gateway = gateway
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
    this.cols = this.io.get("__zkp__/cols") ?? {}
    const kv_zkp = key => ({
      get: k => this.io.get(`__zkp__/${key}_${k}`),
      put: async (k, v) => await this.io.put(`__zkp__/${key}_${k}`, v),
      del: async k => await this.io.del(`__zkp__/${key}_${k}`),
    })
    this.zkdb = new ZKDB({ kv: kv_zkp })
    await this.zkdb.init()

    if (this.type === "vec") {
      const _vec = await lancedb.connect(`${this.dbpath}-${this.pid}.vec`)
      this.db = await vec(this.wkv, { no_commit: true, sql: _vec }) // ??
    } else if (this.type === "sql") {
      const _sql = new DatabaseSync(`${this.dbpath}.sql`)
      this.db = sql(this.wkv, { no_commit: true, sql: _sql })
    } else {
      //this.db = wdb(this.wkv, { no_commit: true })
      if (this.wslot >= 0) {
        let opt = { env: { no_commit: true } }
        let info = this.io.get("_config/info")
        let version = info?.version
        if (version) opt.version = version
        const core = await new Core({
          io: this.io,
          gateway: this.gateway,
          kv: this.wkv,
        }).init(opt)
        this.db = core.db
      }
    }
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
        if (this.wslot + 1 === 0 && msg) {
          let opt = { env: { no_commit: true } }
          const [op, { version }] = JSON.parse(msg.headers.query)
          if (version) opt.version = version
          const core = await new Core({
            io: this.io,
            gateway: this.gateway,
            kv: this.wkv,
          }).init(opt)
          this.db = core.db
        }
        while (msg && i < this.max_msgs) {
          if (this.type === "vec") await this.db.write(msg)
          else await this.db.write(msg)
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
        const commitPromise = new Promise(resolve => (this.resolve = resolve))

        await this.wkv.commit({ delta: true, slot: this.wslot }, async () => {})

        await commitPromise

        if (i >= this.max_msgs) {
          this.ongoing_write = false
          res(await this.write(true))
        } else {
          this.ongoing_write = false
          res(this.wslot)
        }
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
          this.cols,
          this.zkdb,
          this.io,
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
