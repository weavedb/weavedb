import wdb from "./index.js"
import { getMsgs } from "./server-utils.js"
import { isEmpty, sortBy, prop, isNil } from "ramda"
import { json, encode, Encoder, decode, Decoder } from "arjson"
import kv from "./kv.js"
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
let v_hb
const calcZKHash = async changes => {
  if (!zkdb) {
    zkdb = new ZKDB({
      wasmRU: resolve(import.meta.dirname, "circom/rollup/index_js/index.wasm"),
      zkeyRU: resolve(import.meta.dirname, "circom/rollup/index_0001.zkey"),
      wasm: resolve(import.meta.dirname, "circom/db/index_js/index.wasm"),
      zkey: resolve(import.meta.dirname, "circom/db/index_0001.zkey"),
    })
    await zkdb.init()
  }
  for (const v of changes) {
    const [dir, doc] = v.key.split("/")
    if (isNil(cols[dir])) {
      const index = io.get(`_/${dir}`).index
      cols[dir] = index
      await zkdb.addCollection(index)
    }
    try {
      await zkdb.insert(cols[dir], doc, v.data)
      console.log("added to zk tree", dir, doc)
    } catch (e) {
      console.log("zk error", v.data)
    }
  }
  return to64(zkdb.tree.F.toObject(zkdb.tree.root).toString())
}

const buildBundle = async changes => {
  const d = new Decoder()
  let _changes = []
  for (const k in changes)
    _changes.push({ key: k, delta: changes[k].delta, data: changes[k].to })
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

  //decodeBuf(buf)
  const txt = await fetch(`${v_hb}/~meta@1.0/info/serialize~json@1.0`).then(r =>
    r.json(),
  )
  const addr = txt.address
  const tags = {
    method: "POST",
    path: `/${v_pid}/schedule`,
    scheduler: addr,
    zkhash,
    Action: "Commit",
    data: buf.toString("base64"),
  }
  const res = await request(tags)
  console.log()
  console.log(`[${res.slot}] ${res.process}`)
  console.log(`zkhash: ${zkhash}`)
  console.log(buf)
  return { buf, zkhash }
}

let deltas = {}
const getKV = ({ jwk, pid, hb, dbpath }) => {
  io = open({ path: dbpath })
  let addr = null
  return kv(io, async c => {
    let changes = {}
    let i = null
    let slot = null
    for (const d of c.data) {
      i = d.i
      slot = d.opt.slot
      for (const k in d.cl) {
        if (!/^__/.test(k.split("/")[0])) {
          let delta = null
          if (!deltas[k]) {
            let cache = io.get(`__deltas__/${k}`)
            if (cache) {
              for (let v of cache) v[1] = Uint8Array.from(v[1])
              deltas[k] = json(cache, undefined, 2)
            } else {
              deltas[k] = json(null, d.cl[k], 2)
              delta = deltas[k].deltas()[0]
              await io.put(`__deltas__/${k}`, deltas[k].deltas())
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
    const { buf, zkhash } = await buildBundle(changes)
    io.put("__height__", { i, slot })
    io.put("__bundle__", { zkhash, buf })
  })
}

const validate = async ({ pid, jwk, dbpath, hb, validate_pid }) => {
  v_pid = validate_pid
  v_hb = hb
  let i = 0
  let from = 0
  const wkv = getKV({ jwk, hb, dbpath, pid })
  let db = wdb(wkv, { no_commit: true })
  const height = io.get("__height__")
  if (height) {
    from = height.slot + 1
    i = height.i + 1
  }
  let to = from + 99
  if (isNil(request)) {
    if (jwk && hb) {
      ;({ request } = connect({
        MODE: "mainnet",
        URL: hb,
        device: "",
        signer: createSigner(jwk),
      }))
    }
  }
  console.log("lets get...", pid, from, to)
  let res = await getMsgs({ pid, hb, from, to })
  let slot = 0
  let isData = false
  while (!isEmpty(res.assignments)) {
    for (let k in res.assignments ?? {}) {
      const m = res.assignments[k]
      slot = m.slot
      if (m.slot === 0) {
        let from = null
        for (const k in m.body.commitments) {
          const c = m.body.commitments[k]
          if (c.committer) {
            from = c.committer
            break
          }
        }
      }
      if (m.body.data) {
        console.log(m.body.data)
        isData = true
        for (const v of JSON.parse(m.body.data)) {
          const q = JSON.parse(v.query)
          db.set(...q, {
            id: v.id,
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
  if (isData) wkv.commit({ delta: true, slot })
  return db
}

export default validate
