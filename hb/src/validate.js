import { HB } from "wao"
import { DatabaseSync } from "node:sqlite"
import * as lancedb from "@lancedb/lancedb"
import { kv, db as wdb, vec, sql } from "wdb-core"
//import { kv, db as wdb, vec, sql } from "../../core/src/index.js"
import { getMsgs } from "./server-utils.js"
import { isEmpty, sortBy, prop, isNil, keys, pluck, clone } from "ramda"
import { json, encode, Encoder } from "arjson"
import { open } from "lmdb"
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
    res = await request.schedule(obj)
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

  const { err, res } = await schedule(request, {
    pid: vid,
    tags: {
      zkhash,
      Action: "Commit",
      "Data-Protocol": "ao",
      Variant: "ao.TN.1",
    },
    data: buf, //buf.toString("base64"),
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
            let cache = obj.io.get(obj.key(`__deltas__/${k}`))
            if (cache) {
              for (let v of cache) v[1] = Uint8Array.from(v[1])
              obj.deltas[k] = json(cache, undefined, 2)
            } else {
              obj.deltas[k] = json(null, d.cl[k], 2)
              delta = obj.deltas[k].deltas()[0]
              await obj.io.put(
                obj.key(`__deltas__/${k}`),
                obj.deltas[k].deltas(),
              )
            }
          } else {
            delta = obj.deltas[k].update(d.cl[k])
            await obj.io.put(obj.key(`__deltas__/${k}`), obj.deltas[k].deltas())
          }
          if (delta && delta[1].length > 0) {
            changes[k] = { from: c.old[k], to: d.cl[k], delta }
          }
        }
      }
    }
    obj.ch++
    await obj.io.put(obj.key(`__ch__`), obj.ch)
    await obj.io.put(obj.key(`__changes__/${obj.ch}`), changes)
  })
}

// modularize further to handle multi DBs
// 0. controller + classify + utils
// 1. fetch messages
// 2. process DB
// 3. bundle commit

export class Validator {
  constructor({
    pid,
    jwk,
    dbpath,
    vid,
    hb = "http://localhost:10001",
    type = "nosql",
    format = "ans104",
    max_msgs = 100,
  }) {
    this.max_msgs = max_msgs
    this.deltas = {}
    this.pid = pid
    this.jwk = jwk
    this.dbpath = dbpath
    this.hb = hb
    this.vid = vid
    this.type = type
    this.format = format
    this.isInit = false
    this.dbpath = dbpath
    this.io = open({ path: `${dbpath}/${this.pid}/${this.vid}` })
  }
  key(name) {
    return name
  }
  async init(io) {
    this.request = new HB({ url: this.hb, jwk: this.jwk, format: this.format })
    this.height = this.io.get(this.key("__height__")) ?? -1
    this.slot = this.io.get(this.key("__slot__")) ?? -1
    this.wslot = this.io.get(this.key("__wslot__")) ?? -1
    this.cslot = this.io.get(this.key("__cslot__")) ?? -1
    this.ch = this.io.get(this.key("__ch__")) ?? -1
    this.wkv = getKV(this)
    if (this.type === "vec") {
      const _vec = await lancedb.connect(`${this.dbpath}-${this.pid}.vec`)
      this.db = await vec(this.wkv, { no_commit: true, sql: _vec })
    } else if (this.type === "sql") {
      const _sql = new DatabaseSync(`${this.dbpath}.sql`)
      this.db = sql(this.wkv, { no_commit: true, sql: _sql })
    } else this.db = wdb(this.wkv, { no_commit: true })
    this.isInit = true
    return this
  }
  async get() {
    if (!this.isInit) return console.log("not initialized yet...")
    if (this.ongoing) return console.log("getMsgs ongoing...")
    this.ongoing = true
    try {
      let from = 0
      from = this.height + 1
      let from2 = from
      let to = from + 99
      let res = await getMsgs({ pid: this.pid, hb: this.hb, from, to })
      console.log(
        `[${this.pid}:${this.vid}]  ${from} - ${to} (${keys(res?.assignments ?? {}).length})`,
      )
      while (!isEmpty(res.assignments)) {
        let arr = []
        let slots = {}
        for (let k in res.assignments ?? {}) {
          const m = res.assignments[k]
          if (this.height + 1 === m.slot) this.height = m.slot
          if (m.body.data) {
            for (const v of JSON.parse(m.body.data)) {
              if (typeof slots[v.slot] === "undefined") {
                slots[v.slot] = true
                arr.push(v)
                await this.io.put(this.key(`__msg__/${v.slot}`), v)
              }
            }
          }
          from2++
        }
        arr = sortBy(prop("slot"), arr)
        for (let v of arr) {
          if (v.slot === this.slot + 1) this.slot = v.slot
        }
        await this.io.put(this.key("__height__"), this.height)
        await this.io.put(this.key("__slot__"), this.slot)
        if (from2 - from >= 100) {
          from = from2
          to = from + 100
          res = await getMsgs({ pid: this.pid, hb: this.hb, from, to })
        } else break
      }
    } catch (e) {
      console.log(e)
    }
    this.ongoing = false
    return { height: this.height, slot: this.slot }
  }
  async write(force = false) {
    return new Promise(async res => {
      if (!this.isInit) return console.log("not initialized yet...")
      if (this.ongoing_write && force !== true)
        return console.log("getMsgs ongoing...")
      this.ongoing_write = true
      let isData = false
      let i = 0
      try {
        let msg = this.io.get(this.key(`__msg__/${this.wslot + 1}`)) ?? null
        while (msg && i < this.max_msgs) {
          console.log(`${msg.slot}: ${msg.headers?.query}`)
          if (this.type === "vec") await this.db.pwrite(msg)
          else this.db.write(msg)
          isData = true
          this.wslot += 1
          await this.io.put(this.key("__wslot__"), this.wslot)
          msg = this.io.get(this.key(`__msg__/${this.wslot + 1}`)) ?? null
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
    if (!this.isInit) return console.log("not initialized yet...")
    if (this.ongoing_commit) return console.log("getMsgs ongoing...")
    this.ongoing_commit = true
    let hashes = {}
    try {
      let changes =
        this.io.get(this.key(`__changes__/${this.cslot + 1}`)) ?? null
      while (changes) {
        const { buf, zkhash } = await buildBundle(
          changes,
          this.request,
          this.vid,
          this.cslot + 1,
        )
        await this.io.put(this.key("__bundle__"), { zkhash, buf })
        hashes[this.cslot + 1] = { zkhash, size: buf.length }
        this.cslot += 1
        await this.io.put(this.key("__cslot__"), this.cslot)
        changes = this.io.get(this.key(`__changes__/${this.cslot + 1}`)) ?? null
      }
    } catch (e) {
      console.log(e)
    }
    this.ongoing_commit = false
    return hashes
  }
}
