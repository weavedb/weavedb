import { of, ka } from "monade"
import { prop, sortBy, o, filter, isNil } from "ramda"
import zlib from "zlib"
import {
  json as arjson,
  encode,
  Encoder,
  decode,
  Decoder,
  Parser,
} from "arjson"

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

function decodeData({ state, msg, env }) {
  if (state.opcode !== "commit") return arguments[0]
  const n = 3
  const cols = env.kv.get("__cols__", "cols") ?? {}
  const buf = msg.data
  const _buf = zlib.brotliDecompressSync(buf)
  const msgs = []
  const d = new Decoder()
  const left = d.decode(Uint8Array.from(_buf), null)
  let json = d.json
  if (left[0].length !== 8) left.shift()
  let start = 0
  let changes = { dirs: {}, docs: {}, indexes: {}, _: {} }
  for (let v of json) {
    const arr8 = frombits(left.slice(start, start + v[2]))
    start += v[2]
    const [dir, doc] = v[0].split("/")
    const key = v[0]
    const getData = key => {
      let _arjson = null
      const deltas = env.kv.get("__deltas__", key) || []
      if (v[1] === 1) {
        deltas.push([0, arr8])
        _arjson = arjson(deltas, undefined, n)
      } else {
        deltas.push([1, arr8])
        _arjson = arjson(deltas, undefined, n)
      }
      env.kv.put("__deltas__", key, deltas)
      return _arjson.json()
    }
    const newData = getData(key)
    if (dir === "_") {
      if (!isNil(newData?.index)) {
        if (isNil(cols[doc])) {
          cols[doc] = newData.index
          env.kv.put("__cols__", "cols", cols)
        }
        changes.dirs[doc] = { index: newData.index, newData: newData }
      }
      changes._[key] = { dir, doc, newData: newData }
    } else if (dir === "_config") {
      if (/^indexes_\d+$/.test(doc)) {
        const dirid = doc.replace("indexes_", "")
        changes.indexes[dirid] = {
          newData: newData,
        }
      } else {
        changes._[key] = { dir, doc, newData: newData }
      }
    } else if (!/^_/.test(v[0])) {
      changes.docs[dir] ??= {}
      changes.docs[dir][doc] = newData
    } else {
      changes._[key] = { dir, doc, newData: newData }
    }
  }
  for (let k in changes._) {
    const ch = changes._[k]
    if (isNil(ch.newData)) {
      env.kv.del(ch.dir, ch.doc)
    } else {
      env.kv.put(ch.dir, ch.doc, ch.newData)
    }
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

  for (let k in changes.docs) {
    const dir = changes.docs[k]
    for (let k2 in dir) {
      if (k[0] !== "_") {
        const doc = dir[k2]
        if (doc === null) msgs.push(["del:del", [k, k2]])
        else if (typeof doc === "object" && doc !== null)
          msgs.push(["set:set", [doc, k, k2]])
      }
    }
  }
  state.updates = msgs
  env.info = env.kv.get("_config", "info")
  return arguments[0]
}

const decoder = ka().map(decodeData)

export default decoder
