import zlib from "zlib"
import { prop, sortBy, o, filter, isNil } from "ramda"
import {
  json as arjson,
  encode,
  Encoder,
  decode,
  Decoder,
  Parser,
} from "../../../arjson/sdk/src/index.js"
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
import { json } from "../../../arjson/sdk/src/index.js"
import { wait, genDir, genUser } from "./test-utils.js"
import { isEmpty, keys, pluck, clone } from "ramda"
import brotliDecompress from "brotli/decompress.js"
let zkc = 0
let zkc2 = 0
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
        //console.log(v.data)
      }
    } catch (e) {
      console.log("zk error:", JSON.stringify(v.data).length, dir, doc, v.data)
      console.log(e)
    }
  }
  return zkdb.hash()
}

const add = async (dcl, obj, old) => {
  let changes = {}
  for (const k in dcl) {
    const n = 1
    let delta = null
    if (!obj.deltas[k]) {
      let cache = obj.io.get(`__deltas__/${k}`)
      if (cache) {
        for (let v of cache) v[1] = Uint8Array.from(v[1])
        obj.deltas[k] = json(cache, undefined, n)
      } else {
        obj.deltas[k] = json(null, dcl[k], n)
        delta = obj.deltas[k].deltas()[0]
        await obj.io.put(`__deltas__/${k}`, obj.deltas[k].deltas())
      }
    } else {
      delta = obj.deltas[k].update(dcl[k])
      await obj.io.put(`__deltas__/${k}`, obj.deltas[k].deltas())
    }
    if (delta && delta[1].length > 0) {
      changes[k] = { from: old[k] ?? null, to: dcl[k], delta }
    }
  }
  return changes
}

const buildBundle = async (changes, cols, zkdb, io) => {
  let _changes = []
  for (const k in changes) {
    _changes.push({ key: k, delta: changes[k].delta, data: changes[k].to })
  }
  _changes = sortBy(prop("key"), _changes)
  let header = []
  let bytes = []
  let i = 0
  for (const v of _changes) {
    header.push([v.key, v.delta[0], v.delta[1].length])
    bytes.push(v.delta[1])
    i++
  }
  let u = new Encoder(4)
  const enc = encode(header, u)
  bytes.unshift(enc)
  const totalLen = bytes.reduce((sum, arr) => sum + arr.length, 0)
  const buf = Buffer.alloc(totalLen)
  let offset = 0
  for (const arr of bytes) {
    buf.set(arr, offset)
    offset += arr.length
  }
  //console.log(_changes)
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
  return { buf, zkhash, compressed }
}

let io1, io2, obj, zkdb, cols
let i2 = 0
describe("Decode", () => {
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
    const { zkhash, compressed } = await gen({ init: true })
    const cols2 = {}
    const ok = await decoder({ io: io2, cols: cols2, buf: compressed, zkhash })
    console.log(ok)
    while (true) {
      console.log(".....................................................")
      const { zkhash, compressed } = await gen({ num: 300 })
      const ok = await decoder({
        io: io2,
        cols: cols2,
        buf: compressed,
        zkhash,
      })
      console.log(ok)
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
  const changes = await add(ch, obj, {})
  return await buildBundle(changes, cols, zkdb, io1)
}
const decoder = async ({ io, cols, buf, zkhash }) => {
  const kv_zkp = key => ({
    get: k => io.get(`__zkp__/${key}_${k}`),
    put: async (k, v) => await io.put(`__zkp__/${key}_${k}`, v),
    del: async k => await io.del(`__zkp__/${key}_${k}`),
  })

  const _store = _kv => {
    const get = (dir, doc) => _kv.get(`${dir}/${doc}`)
    const put = (dir, doc, data) => _kv.put(`${dir}/${doc}`, data)
    const del = (dir, doc) => _kv.del(`${dir}/${doc}`)
    const commit = (...params) => _kv.commit(...params)
    const reset = (...params) => _kv.reset(...params)
    return { ..._kv, get, put, del, commit, reset }
  }
  const kv = _store(io)
  const zkdb = new DBTree({ kv: kv_zkp })
  await zkdb.init()
  const n = 1
  let xio = []
  try {
    xio = JSON.parse(readFileSync("/home/basque/bug.json", "utf8"))
  } catch (e) {}
  xio.push({ zkhash, bits: Array.from(compressed) })
  writeFileSync("/home/basque/bug.json", JSON.stringify(xio))

  const _buf = brotliDecompress(buf)
  const msgs = []
  const d = new Decoder()
  const left = d.decode(_buf, null)
  let json = d.json
  console.log("left zero.............", left[0], left[0].length)
  if (left[0].length !== 8) left.shift()
  let start = 0
  let changes = { dirs: {}, docs: {}, indexes: {}, _: {} }
  let update = false
  for (let v of json) {
    const arr8 = frombits(left.slice(start, start + v[2]))
    start += v[2]
    const [dir, doc] = v[0].split("/")
    const key = v[0]
    const getData = key => {
      let _arjson = null
      const deltas = kv.get("__deltas__", key) || []
      deltas.push([v[1], arr8])
      //console.log("deltas", key, deltas, n)
      console.log(deltas)
      _arjson = arjson(deltas, undefined, n)
      kv.put("__deltas__", key, deltas)
      return _arjson.json()
    }
    const newData = getData(key)
    //console.log(dir, doc, newData)
    if (dir === "_" && !isNil(newData?.index) && isNil(cols[doc])) {
      cols[doc] = newData.index
      update = true
      await zkdb.addCollection(newData.index)
      console.log(
        `<${zkc2++}> new dir added to zk tree`,
        newData.index,
        zkdb.hash(),
      )
    }
    try {
      if (isNil(newData)) {
        await zkdb.delete(cols[dir], doc)
        console.log(`<${zkc2++}> deleted from zk tree`, dir, doc, zkdb.hash())
      } else {
        await zkdb.insert(cols[dir], doc, newData)
        console.log(`<${zkc2++}> added to zk tree`, dir, doc, zkdb.hash())
        //console.log(newData)
      }

      update = true
    } catch (e) {
      console.log(e)
      console.log("zk error", JSON.stringify(newData).length, dir, doc, newData)
    }
  }
  if (zkdb.hash() !== zkhash) throw Error("hash mismatch")
  return true
}
