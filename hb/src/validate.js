import wdb from "./index.js"
import { getMsgs } from "./server-utils.js"
import { isEmpty, sortBy, prop } from "ramda"
import { json, encode, Encoder, Decoder } from "arjson"
import kv from "./kv.js"
import { open } from "lmdb"

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

const decodeBuf = buf => {
  const q = Uint8Array.from(buf)
  const d = new Decoder()
  const left = d.decode(q, null)
  let json = d.json
  if (left[0].length !== 8) left.shift()
  let start = 0
  for (let k in json) {
    const arr8 = frombits(left.slice(start, start + json[k][1]))
    start += json[k][1]
  }
}

const buildBundle = changes => {
  let _changes = []
  for (const k in changes) _changes.push({ key: k, delta: changes[k].delta })
  _changes = sortBy(prop("key"), _changes)
  let header = {}
  let bytes = []
  let i = 0
  for (const v of _changes) {
    header[v.key] = [v.delta[0] + 1, v.delta[1].length]
    bytes.push(v.delta[1])
    i++
  }
  let u = new Encoder()
  const enc = encode(header, u)
  bytes.unshift(enc)
  const totalLen = bytes.reduce((sum, arr) => sum + arr.length, 0)
  const buf = Buffer.alloc(totalLen)
  let offset = 0
  for (const arr of bytes) {
    buf.set(arr, offset)
    offset += arr.length
  }
  decodeBuf(buf)
}

let deltas = {}
const getKV = ({ jwk, pid, hb, dbpath }) => {
  const io = open({ path: dbpath })
  let addr = null
  return kv(io, async c => {
    let changes = {}
    for (const d of c.data) {
      for (const k in d.cl) {
        if (k.split("/")[0] !== "__indexes__") {
          let delta = null
          if (!deltas[k]) {
            let cache = io.get(`__deltas__/${k}`)
            if (cache) {
              for (let v of cache) v[1] = Uint8Array.from(v[1])
              deltas[k] = json(cache)
            } else {
              deltas[k] = json(null, d.cl[k])
              delta = deltas[k].deltas()[0]
              await io.put(`__deltas__/${k}`, deltas[k].deltas())
              const cache = io.get(`__deltas__/${k}`)
            }
          } else {
            delta = deltas[k].update(d.cl[k])
            await io.put(`__deltas__/${k}`, deltas[k].deltas())
          }
          changes[k] = {
            from: c.old[k],
            to: d.cl[k],
            delta,
          }
        }
      }
    }
    buildBundle(changes)
  })
}

const validate = async ({ pid, jwk, dbpath, hb }) => {
  let i = 0
  let db = null
  let from = 0
  let to = 99
  let res = await getMsgs({ pid, hb })
  const wkv = getKV({ jwk, hb, dbpath, pid })
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
        db = wdb(wkv, { no_commit: true }).init({ from, id: pid })
      }
      if (m.body.data) {
        for (const v of JSON.parse(m.body.data)) {
          const q = JSON.parse(v.query)
          db.set(...q, {
            slot: m.slot,
            nonce: v.nonce,
            signature: v.signature,
            "signature-input": v["signature-input"],
          })
          i++
        }
      }
    }
    from += 100
    to += 100
    res = await getMsgs({ pid, hb, from, to })
  }
  wkv.commit({ delta: true })
  return db
}

export default validate
