import { of, pka } from "monade"
import { prop, sortBy, o, filter, isNil } from "ramda"
import brotliDecompress from "brotli/decompress.js"
import {
  json as arjson,
  encode,
  Encoder,
  decode,
  Decoder,
  Parser,
} from "arjson"
import DBTree from "zkjson/smt"

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

async function decodeData({ state, msg, env }) {
  if (state.opcode !== "commit") return arguments[0]
  const { kv } = env
  const kv_zkp = key => ({
    get: k => kv.get("__zkp__", `${key}_${k}`),
    put: (k, v) => kv.put("__zkp__", `${key}_${k}`, v),
    del: k => kv.del("__zkp__", `${key}_${k}`),
  })
  const zkdb = new DBTree({ kv: kv_zkp })
  await zkdb.init()
  const n = 1
  const cols = env.kv.get("__zkp__", "cols") ?? {}
  let buf = msg.data
  if (msg.bytelen) buf = buf.slice(0, msg.bytelen)
  env.info.total_size += buf.length
  kv.put("__sst__", "info", env.info)
  const _buf = brotliDecompress(buf)
  const msgs = []
  const d = new Decoder()
  const left = d.decode(_buf, null)
  let json = d.json
  // handle left[0] undefined error
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
      const deltas = env.kv.get("__deltas__", key) || []
      deltas.push([v[1], arr8])
      _arjson = arjson(deltas, undefined, n)
      env.kv.put("__deltas__", key, deltas)
      return _arjson.json()
    }
    const newData = getData(key)
    if (dir === "_" && !isNil(newData?.index) && isNil(cols[doc])) {
      cols[doc] = newData.index
      update = true
      await zkdb.addCollection(newData.index)
      console.log(`new dir added to zk tree`, newData.index)
      env.kv.put("__zkp__", "cols", cols)
    }
    try {
      if (isNil(newData)) {
        await zkdb.delete(cols[dir], doc)
        console.log(`deleted from zk tree`, dir, doc)
      } else {
        await zkdb.insert(cols[dir], doc, newData)
        console.log(`added to zk tree`, dir, doc)
      }

      update = true
    } catch (e) {
      console.log(e)
      console.log("zk error", JSON.stringify(newData).length, dir, doc, newData)
    }

    if (dir === "_") {
      if (!isNil(newData?.index)) {
        if (isNil(cols[doc])) {
          cols[doc] = newData.index
          env.kv.put("__zkp__", "cols", cols)
        }
        changes.dirs[doc] = { index: newData.index, newData: newData }
      }
      changes._[key] = { dir, doc, newData: newData }
    } else if (dir === "_config") {
      if (/^indexes_\d+$/.test(doc)) {
        const dirid = doc.replace("indexes_", "")
        changes.indexes[dirid] = { newData: newData }
      } else changes._[key] = { dir, doc, newData: newData }
    } else if (!/^_/.test(v[0])) {
      changes.docs[dir] ??= {}
      changes.docs[dir][doc] = newData
    } else changes._[key] = { dir, doc, newData: newData }
  }
  let dirs = []
  for (let k in changes.dirs) {
    const dirData = changes.dirs[k]
    dirs.push({ index: dirData.index, name: k })
  }
  const _dirs = o(
    sortBy(prop("index")),
    filter(v => v.name[0] !== "_"),
  )(dirs)

  for (let dirid in changes.indexes) {
    const indexData = changes.indexes[dirid]
    const oldIndexes = env.kv.get("_config", `indexes_${dirid}`) ?? []
    const newIndexes = indexData.newData?.indexes || []
    let dirName = null
    for (let k in changes.dirs) {
      if (changes.dirs[k].index === parseInt(dirid)) {
        dirName = k
        break
      }
    }
    if (!dirName) {
      for (let k in cols) {
        if (cols[k] === parseInt(dirid)) {
          dirName = k
          break
        }
      }
    }
    if (dirName && dirName[0] !== "_") {
      const oldIndexSet = new Set(oldIndexes.map(idx => JSON.stringify(idx)))
      const newIndexSet = new Set(newIndexes.map(idx => JSON.stringify(idx)))
      for (const oldIdx of oldIndexes) {
        const idxKey = JSON.stringify(oldIdx)
        if (!newIndexSet.has(idxKey))
          msgs.push(["removeIndex", [oldIdx, dirName]])
      }
      for (const newIdx of newIndexes) {
        const idxKey = JSON.stringify(newIdx)
        if (!oldIndexSet.has(idxKey)) msgs.push(["addIndex", [newIdx, dirName]])
      }
    }
  }
  for (let k in changes._) {
    const ch = changes._[k]
    if (isNil(ch.newData)) env.kv.del(ch.dir, ch.doc)
    else env.kv.put(ch.dir, ch.doc, ch.newData)
  }

  for (let k in changes.docs) {
    const dir = changes.docs[k]
    for (let k2 in dir) {
      if (k[0] !== "_") {
        const doc = dir[k2]
        if (doc === null) msgs.push(["del", [k, k2]])
        else if (typeof doc === "object" && doc !== null)
          msgs.push(["set", [doc, k, k2]])
      }
    }
  }
  state.updates = msgs
  if (zkdb.hash() !== msg.zkhash) throw Error("hash mismatch")
  return arguments[0]
}

const decoder = pka().map(decodeData)

export default decoder
