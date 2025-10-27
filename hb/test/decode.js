import zlib from "zlib"
import { readFileSync, writeFileSync } from "fs"
import { prop, sortBy, o, filter, isNil } from "ramda"
import { enc, dec, encode, Encoder, Decoder, ARTable, ARJSON } from "arjson"
function frombits(bitArray) {
  const bitStr = bitArray.join("")
  const byteCount = Math.ceil(bitStr.length / 8)
  const result = new Uint8Array(byteCount)
  for (let i = 0; i < byteCount; i++) {
    const start = i * 8
    const end = Math.min(start + 8, bitStr.length)
    const bits = bitStr.substring(start, end).padEnd(8, "0")
    result[i] = parseInt(bits, 2)
  }
  return result
}

import { DBTree as ZKDB } from "zkjson"
import { promisify } from "util"
const brotliCompress = promisify(zlib.brotliCompress)
import assert from "assert"
import { describe, it } from "node:test"
import { wait, genDir, genUser } from "./test-utils.js"
import { isEmpty, keys, pluck, clone } from "ramda"
import brotliDecompress from "brotli/decompress.js"
let zkc = 0
import DBTree from "zkjson/smt"

const calcZKHash = async (changes, cols, zkdb, io) => {
  for (const v of changes) {
    const [dir, doc] = v.key.split("/")
    if (dir === "_" && isNil(cols[doc]) && !isNil(v.data?.index)) {
      cols[doc] = v.data.index
      await io.put("__zkp__", "cols", cols)
      await zkdb.addCollection(v.data.index)
      console.log(
        `[${zkc++}] collection added to zk tree`,
        doc,
        v.data.index,
        zkdb.hash(),
      )
    }
    try {
      if (isNil(v.data)) {
        await zkdb.delete(cols[dir], doc)
        console.log(`[${zkc++}] deleted from zk tree`, dir, doc, zkdb.hash())
      } else {
        await zkdb.insert(cols[dir], doc, v.data)
        console.log(`[${zkc++}] added to zk tree`, dir, doc, zkdb.hash())
      }
    } catch (e) {
      console.log("zk error:", JSON.stringify(v.data).length, dir, doc, v.data)
      console.log(e)
    }
  }
  return zkdb.hash()
}

const add = async (dcl, obj) => {
  let changes = {}
  for (const k in dcl) {
    let cache = obj.io.get(`__deltas__/${k}`)
    let arj = null
    let deltas = null
    if (!cache) {
      arj = new ARJSON({ json: dcl[k] })
      deltas = arj.deltas
    } else {
      arj = new ARJSON({ table: cache })
      deltas = arj.update(dcl[k])
    }
    if (deltas && deltas.length > 0) {
      await obj.io.put(`__deltas__/${k}`, arj.artable.table())
      changes[k] = { to: dcl[k], deltas }
    }
  }
  return changes
}

const decodeBuf = buf => {
  const d = new Decoder()
  const left = d.decode(buf, null)
  let header = d.json
  //if (left[0].length !== 8) left.shift()
  const deltaBytes = frombits(left)
  const changes = []
  let offset = 0
  for (const [key, numDeltas] of header) {
    const deltas = []
    for (let i = 0; i < numDeltas; i++) {
      let deltaLen = 0
      let shift = 0
      let byte

      do {
        byte = deltaBytes[offset++]
        deltaLen += (byte & 0x7f) * Math.pow(2, shift)
        shift += 7
      } while (byte & 0x80)

      const delta = deltaBytes.slice(offset, offset + deltaLen)
      deltas.push(delta)
      offset += deltaLen
    }
    changes.push({ key, deltas })
  }
  return changes
}

const buildBundle = async (changes, cols, zkdb, io) => {
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
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_GENERIC,
    [zlib.constants.BROTLI_PARAM_LGWIN]: 24,
    [zlib.constants.BROTLI_PARAM_LGBLOCK]: 24,
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
  }
  const compressed = await brotliCompress(buf, params)
  console.log()
  console.log(`<zkhash: ${zkhash}> : ${buf.length} bytes`)
  return { buf, zkhash, compressed, changes }
}

let io1, io2, obj, zkdb, cols
let i2 = 0
const prepare = async () => {
  const getIO = () => {
    const store = {}
    const io = {
      get: k => store[k],
      put: async (k, v) => (store[k] = v),
      del: async k => delete store[k],
    }
    return io
  }
  io1 = getIO()
  io2 = getIO()
  obj = { deltas: {}, io: io1 }

  cols = {}
  const kv_zkp = key => ({
    get: k => io1.get(`__zkp__/${key}_${k}`),
    put: async (k, v) => await io1.put(`__zkp__/${key}_${k}`, v),
    del: async k => await io1.del(`__zkp__/${key}_${k}`),
  })
  zkdb = new ZKDB({ kv: kv_zkp })
  await zkdb.init()
}
const arr = [
  {
    id: "ooXIc8o9EvuQBYxAHo",
    username: "1AiOz1Gh5YC5",
    name: "Alice Miller",
    bio: "UEDy2Lj1tZD9LWqd X73HQ5TSOnJrgqMtGJl9vHeAnUphwl gqdxhE88cfg6fMvenLxaXdvoVxov5zDe4cQb",
    age: 60,
    role: "engineer",
    active: false,
    metadata: { department: "admin", level: 3, certified: false },
    preferences: { theme: "light", notifications: false, language: "en" },
    tags: ["guest", "designer"],
  },
  { name: "Henry Jones", age: 29, role: "user", id: 82447 },
  {
    username: "D2XqIb4s",
    name: "Henry Miller",
    email: "UAawx4@example.com",
    age: 22,
    active: true,
    score: 961,
    role: "guest",
    tags: ["developer", "developer", "guest"],
  },
]

describe("Decode", () => {
  it("should encode and decode", async () => {
    const arr = [{ a: 1 }, { b: 2, d: "a", e: 3 }, { c: 4 }]
    let aj = null
    for (let data of arr) {
      if (!aj) aj = new ARJSON({ json: data })
      else aj.update(data)
    }
    assert.deepEqual(aj.json, arr[arr.length - 1])
  })

  it("should encode and decode", async () => {
    await prepare()
    const xio = [
      {
        changes: {
          "users/1": {
            id: "ooXIc8o9EvuQBYxAHo",
            username: "1AiOz1Gh5YC5",
            name: "Alice Miller",
            bio: "UEDy2Lj1tZD9LWqd X73HQ5TSOnJrgqMtGJl9vHeAnUphwl gqdxhE88cfg6fMvenLxaXdvoVxov5zDe4cQb",
            age: 60,
            role: "engineer",
            active: false,
            metadata: { department: "admin", level: 3, certified: false },
            preferences: {
              theme: "light",
              notifications: false,
              language: "en",
            },
            tags: ["guest", "designer"],
          },
        },
      },
      {
        changes: {
          "users/1": { name: "Henry Jones", age: 29, role: "user", id: 82447 },
        },
      },
      {
        changes: {
          "users/1": {
            username: "D2XqIb4s",
            name: "Henry Miller",
            email: "UAawx4@example.com",
            age: 22,
            active: true,
            score: 961,
            role: "guest",
            tags: ["developer", "developer", "guest"],
          },
        },
      },
    ]

    let aj = null
    let json = null
    for (let v of xio) {
      for (let k in v.changes) {
        if (k === "users/1") {
          let data = v.changes[k].to
          if (!aj) aj = new ARJSON({ json: data })
          else aj.update(data)
          json = data
        }
      }
    }
    assert.deepEqual(aj.json, json)
    const newjson = new ARJSON({ arj: aj.toBuffer() })
    assert.deepEqual(newjson.json, json)
    const cols2 = {}
    for (let v of xio) {
      const { zkhash, compressed, changes } = await gen({ init: true })
      await decoder({ io: io2, cols: cols2, buf: compressed })
    }
  })

  it("should encode and decode", async () => {
    const getIO = () => {
      const store = {}
      const io = {
        get: k => store[k],
        put: async (k, v) => (store[k] = v),
        del: async k => delete store[k],
      }
      return io
    }
    io1 = getIO()
    io2 = getIO()
    obj = { deltas: {}, io: io1 }

    cols = {}
    const kv_zkp = key => ({
      get: k => io1.get(`__zkp__/${key}_${k}`),
      put: async (k, v) => await io1.put(`__zkp__/${key}_${k}`, v),
      del: async k => await io1.del(`__zkp__/${key}_${k}`),
    })
    zkdb = new ZKDB({ kv: kv_zkp })
    await zkdb.init()
    let i = 0
    const { zkhash, compressed, changes } = await gen({ init: true })
    const cols2 = {}
    const ok = await decoder({
      io: io2,
      cols: cols2,
      buf: compressed,
      zkhash,
      changes,
    })
    while (true) {
      const { zkhash, compressed, changes } = await gen({ num: 300 })
      const ok = await decoder({
        io: io2,
        cols: cols2,
        buf: compressed,
        zkhash,
        changes,
      })
    }
  })
})

const gen = async ({ init, num = 10 }) => {
  let ch = init
    ? {
        "_/_": { index: 0 },
        "_/_config": { index: 1 },
        "_config/info": { i: i2, ts: Date.now() },
        "_/users": { index: 2 },
      }
    : { "_config/info": { i: i2, ts: Date.now() } }
  for (let i = 0; i < num + i2; i++) ch["users/" + i] = genUser()
  i2 += num
  const changes = await add(ch, obj)
  return await buildBundle(changes, cols, zkdb, io1)
}

const decoder = async ({ io, cols, buf }) => {
  const _store = _kv => {
    const get = (dir, doc) => _kv.get(`${dir}/${doc}`)
    const put = (dir, doc, data) => _kv.put(`${dir}/${doc}`, data)
    const del = (dir, doc) => _kv.del(`${dir}/${doc}`)
    const commit = (...params) => _kv.commit(...params)
    const reset = (...params) => _kv.reset(...params)
    return { ..._kv, get, put, del, commit, reset }
  }
  const kv = _store(io)
  const n = 1
  const _buf = brotliDecompress(buf)
  const decoded = decodeBuf(_buf)
  for (let v of decoded) {
    const key = v.key
    const [dir, doc] = key.split("/")
    let arj = null
    const cache = kv.get("__deltas__", key)
    if (cache) arj = new ARJSON({ table: cache })
    for (let v2 of v.deltas) {
      if (!arj) arj = new ARJSON({ arj: ARJSON.toBuffer([v2]) })
      else arj.load(Buffer.from(v2))
    }
    kv.put("__deltas__", key, arj.artable.table())
  }
  return true
}
