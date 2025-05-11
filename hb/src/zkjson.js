import { getMsgs } from "./server-utils.js"
import { isNil, isEmpty } from "ramda"
import { resolve } from "path"
let zkhash = null
import { open } from "lmdb"
import { DB as ZKDB } from "zkjson"
let zkdb = null
let cols = {}
let io = null
import { json, encode, Encoder, decode, Decoder } from "arjson"
let wkv = io
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

const decodeBuf = async buf => {
  if (!zkdb) {
    zkdb = new ZKDB({
      wasmRU: resolve(import.meta.dirname, "circom/rollup/index_js/index.wasm"),
      zkeyRU: resolve(import.meta.dirname, "circom/rollup/index_0001.zkey"),
      wasm: resolve(import.meta.dirname, "circom/db/index_js/index.wasm"),
      zkey: resolve(import.meta.dirname, "circom/db/index_0001.zkey"),
    })
    await zkdb.init()
  }

  const q = Uint8Array.from(buf)
  const d = new Decoder()
  const left = d.decode(q, null)
  let json = d.json
  if (left[0].length !== 8) left.shift()
  let start = 0
  for (let v of json) {
    const arr8 = frombits(left.slice(start, start + v[2]))
    start += v[2]
    const data = decode(arr8, d)
    await io.put(v[0], data)
    const [dir, doc] = v[0].split("/")
    if (isNil(cols[dir])) {
      // todo: cannot get dir
      const index = io.get(`____/${dir}`).index
      cols[dir] = index
      await zkdb.addCollection(index)
    }
    try {
      await zkdb.insert(cols[dir], doc, data)
      console.log("added to zk tree", dir, doc, data)
    } catch (e) {
      console.log("zk error", data)
    }
  }
}

const zkjson = async ({ dbpath, hb, pid }) => {
  let i = 0
  let db = null
  let from = 0
  let to = 99
  let res = await getMsgs({ pid, hb })
  io ??= open({ path: dbpath })
  while (!isEmpty(res.assignments)) {
    for (let k in res.assignments ?? {}) {
      const m = res.assignments[k]
      if (m.slot === 0) {
        let from = null
        for (const k in m.body.commitments) {
          const c = m.body.commitments[k]
          if (c.committer) {
            from = c.committer
            break
          }
        }
      } else {
        zkhash = m.body.zkhash
        const buf = Buffer.from(m.body.data, "base64")
        decodeBuf(buf)
      }
    }
    from += 100
    to += 100
    res = await getMsgs({ pid, hb, from, to })
  }
  return {
    proof: async ({ dir, doc, path, query }) => {
      const col_id = io.get(`____/${dir}`)?.index
      const json = io.get(`${dir}/${doc}`)
      let params = {
        json,
        col_id,
        path,
        id: doc,
      }
      if (query) params.query = query
      return await zkdb.genProof(params)
    },
  }
}

export default zkjson
