import { getMsgs } from "./server-utils.js"
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import abi from "./zkdb_ab.js"
import { isNil, isEmpty } from "ramda"
import { resolve } from "path"
import { json, encode, Encoder, decode, Decoder } from "arjson"
import {
  ethers,
  Wallet,
  getDefaultProvider,
  Contract,
  JsonRpcProvider,
} from "ethers"
let zkhash = null
import { open } from "lmdb"
import { NFT, DB as ZKDB } from "zkjson"

let dbs = {}
let app = null
let default_pid = null

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
function schema2sql(schema, primary = "id", auto_inc = false) {
  if (
    !schema ||
    schema.type !== "object" ||
    !schema.title ||
    !schema.properties
  ) {
    throw new Error("Invalid JSON Schema")
  }

  const tableName = schema.title
  const props = schema.properties
  const required = new Set(schema.required || [])

  const columns = Object.entries(props).map(([name, prop]) => {
    let sqlType = "TEXT" // default

    switch (prop.type) {
      case "integer":
        sqlType = "INTEGER"
        break
      case "number":
        sqlType = "REAL"
        break
      case "boolean":
        sqlType = "BOOLEAN"
        break
      case "string":
        sqlType = "TEXT"
        break
    }

    const isPrimary = name === primary
    const notNull = required.has(name) || isPrimary ? "NOT NULL" : ""
    const primaryKey = isPrimary ? "PRIMARY KEY" : ""
    const auto = isPrimary && auto_inc ? "AUTOINCREMENT" : ""

    return `  ${name} ${sqlType} ${notNull} ${primaryKey} ${auto}`.trim()
  })

  const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n${columns.join(",\n")}\n);`
  return sql
}

function toInsert(schema, data, primary = "id") {
  if (
    !schema ||
    schema.type !== "object" ||
    !schema.title ||
    !schema.properties
  ) {
    throw new Error("Invalid JSON Schema")
  }

  const table = schema.title
  const keys = Object.keys(schema.properties)

  const columns = keys.join(", ")
  const values = keys
    .map(k => {
      const v = data[k]
      if (typeof v === "string") return `'${v.replace(/'/g, "''")}'` // escape single quotes
      if (v === null || v === undefined) return "NULL"
      return v
    })
    .join(", ")

  const update = keys
    .filter(k => k !== primary)
    .map(k => `${k} = excluded.${k}`)
    .join(", ")

  const sql = `INSERT INTO ${table} (${columns})\nVALUES (${values})\nON CONFLICT(${primary}) DO UPDATE SET\n  ${update};`

  return sql
}

let schemas = {}
const decodeBuf = async (buf, sql, pid) => {
  let update = false
  if (!dbs[pid].zkdb) {
    dbs[pid].zkdb = new ZKDB({
      wasm: resolve(import.meta.dirname, "circom/db/index_js/index.wasm"),
      zkey: resolve(import.meta.dirname, "circom/db/index_0001.zkey"),
    })
    await dbs[pid].zkdb.init()
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
    if (sql) {
      try {
        if (/^_\//.test(v[0])) {
          if (v[0].split("/")[1][0] !== "_") {
            const table_name = v[0].split("/")[1]
            console.log(`[${pid}]`, "add table:", table_name)
            schemas[table_name] = { primary: data.primary, schema: data.schema }
            sql.exec(schema2sql(data.schema, data.primary, data.auto_inc))
          }
        } else if (!/^_/.test(v[0])) {
          const table_name = v[0].split("/")[0]
          console.log(`[${pid}]`, "add data:", v[0], data)
          const schema = schemas[table_name]
          const insert = toInsert(schema.schema, data, schema.primary)
          sql.exec(insert)
        }
      } catch (e) {
        console.log(`[${pid}]`, e)
      }
    }

    const [dir, doc] = v[0].split("/")
    if (!(dir === "_" && isNil(data))) await dbs[pid].io.put(v[0], data)
    if (dir === "_" && !isNil(data?.index) && isNil(dbs[pid].cols[doc])) {
      dbs[pid].cols[doc] = data.index
      update = true
      await dbs[pid].zkdb.addCollection(data.index)
    }
    try {
      await dbs[pid].zkdb.insert(dbs[pid].cols[dir], doc, data)
      update = true
      console.log(`[${pid}]`, "added to zk tree", dir, doc, data)
      //const hash = dbs[pid].zkdb.tree.F.toObject(dbs[pid].zkdb.tree.root).toString()
    } catch (e) {
      console.log(`[${pid}]`, e)
      console.log(`[${pid}]`, "zk error", data)
    }
  }
  return update
}
const addServer = ({ port }) => {
  app.post("/cid", async (req, res) => {
    let zkp = null
    let success = false
    let error = null
    let pid
    const { cid } = req.body
    try {
      pid = req.body.pid ?? default_pid
      zkp = await dbs[pid].proof_cid(req.body)
      success = true
    } catch (e) {
      console.log(`[${pid}]`, e)
      error = e.toString()
    }
    res.json({ success, zkp, error })
  })
  app.post("/zkp", async (req, res) => {
    let zkp = null
    let success = false
    let error = null
    let dirid = null
    let pid = null
    const toInt = base64 => {
      const buffer = Buffer.from(base64, "base64")
      let result = 0n
      for (const byte of buffer) {
        result = (result << 8n) | BigInt(byte)
      }
      return result.toString()
    }
    try {
      pid = req.body.pid ?? default_pid
      zkp = await dbs[pid]?.proof(req.body)
      dirid = dbs[pid].io.get(`_/${req.body.dir}`)?.index
      success = true
      const hash = dbs[pid].zkdb.tree.F.toObject(
        dbs[pid].zkdb.tree.root,
      ).toString()
    } catch (e) {
      console.log(`[${pid}]`, e)
      error = e.toString()
    }
    res.json({
      success,
      zkp,
      error,
      query: req.body,
      zkhash: toInt(zkhash),
      dirid,
    })
  })
}
const startServer = ({ port }) => {
  app = express()
  app.use(cors())
  app.use(bodyParser.json())
  return app.listen(port, () => console.log(`ZK Prover on port ${port}`))
}

//let i = 0
//let from = 0
//let height = -1
//let committed_height = -1
let server = null
// preserve zkdb state somehow and continue

const zkjson = async ({
  dbpath,
  hb,
  pid,
  cid = false,
  sql,
  port,
  dbpath_hb,
  commit,
  alchemy_key,
  priv_key,
}) => {
  if (!dbs[pid]) {
    default_pid = pid
    dbs[pid] = {
      from: 0,
      height: -1,
      committed_height: -1,
      io: null,
      io_hb: null,
      zkdb: null,
      cols: {},
      proof: null,
      proof_cid: null,
    }
  }
  dbs[pid].io ??= open({ path: dbpath })
  dbs[pid].io_hb ??= open({ path: dbpath_hb })
  const exists = dbs[pid].io_hb.get("height") ?? -1
  if (dbs[pid].committed_height === -1) {
    dbs[pid].committed_height = dbs[pid].io_hb.get("committed_height") ?? -1
  }
  let res = null
  let to = 0
  let plus = 100
  if (exists > dbs[pid].height) {
    plus = 1
    res = { assignments: {} }
    for (let i = dbs[pid].height + 1; i <= exists; i++) {
      res.assignments[Number(i).toString()] = dbs[pid].io_hb.get(["data", i])
      to = i
      plus += 1
    }
  }
  if (res === null) {
    if (dbs[pid].height) dbs[pid].from = dbs[pid].height + 1
    to = dbs[pid].from + 99
    //console.log(`[${pid}]`, "getting...", dbs[pid].from, to)
    res = await getMsgs({ pid, hb, from: dbs[pid].from, to })
  }
  let update = false
  while (!isEmpty(res.assignments)) {
    for (let k in res.assignments ?? {}) {
      const m = res.assignments[k]
      if (dbs[pid].io_hb) {
        dbs[pid].io_hb.put(["data", m.slot], m)
      }
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
        if (m.body.zkhash) {
          zkhash = m.body.zkhash
          const buf = m.body.data //Buffer.from(m.body.data, "base64")
          if (await decodeBuf(buf, sql, pid)) update = true
        }
      }
      dbs[pid].height = m.slot
    }
    dbs[pid].io_hb.put("height", dbs[pid].height)
    dbs[pid].from += plus
    to = dbs[pid].from + 100
    console.log(
      `[${pid}]`,
      "height",
      dbs[pid].height,
      "from:",
      dbs[pid].from,
      "to:",
      to,
    )
    res = await getMsgs({ pid, hb, from: dbs[pid].from, to })
  }
  const proof = async ({ dir, doc, path, query }) => {
    const col_id = dbs[pid].cols[dir]
    const json = dbs[pid].io.get(`${dir}/${doc}`)
    let params = {
      json,
      col_id,
      path,
      id: doc,
    }
    if (query) params.query = query
    const key = [
      params.col_id,
      params.id,
      params.path,
      params.query ? JSON.stringify(params.query) : null,
    ]
    console.log(`[${pid}]`, "generating zkp...", dir, doc)
    console.log(`[${pid}]`, params)
    const zkp = dbs[pid].io.get(key) ?? (await dbs[pid].zkdb.genProof(params))
    await dbs[pid].io.put(key, zkp)
    return zkp
  }
  const proof_cid = !cid
    ? null
    : async ({ dir, doc, path, cid, query }) => {
        const json = dbs[pid].io.get(`${dir}/${doc}`)
        console.log(`[${pid}]`, "json", dir, doc, json)
        let params = {
          json: json?.json ?? null,
          dir,
          path,
          id: doc,
        }
        if (query) params.query = query
        if (json?.cid !== cid) throw Error("No CID found")
        const key = [
          "cid",
          cid,
          path,
          params.query ? JSON.stringify(params.query) : null,
        ]
        console.log(`[${pid}]`, "generating zkp for cid...", key)
        const zknft = new NFT({
          wasm: resolve(import.meta.dirname, "circom/ipfs/index_js/index.wasm"),
          zkey: resolve(import.meta.dirname, "circom/ipfs/index_0001.zkey"),
          json: params.json,
          size_val: 34,
          size_path: 5,
        })

        const zkp = dbs[pid].io.get(key) ?? (await zknft.zkp(path))
        await dbs[pid].io.put(key, zkp)
        return zkp
      }
  dbs[pid].proof ??= proof
  dbs[pid].proof_cid ??= proof_cid
  if (port && !server) {
    server = startServer({ port })
    addServer({ port })
  }
  if (update && commit && dbs[pid].committed_height < dbs[pid].height) {
    console.log(`[${pid}]`, "committing hash...", commit)
    const provider = new JsonRpcProvider(
      `https://eth-sepolia.g.alchemy.com/v2/${alchemy_key}`,
    )
    const wallet = new Wallet(priv_key, provider)
    const contract = new ethers.Contract(commit, abi, wallet)
    const hash = dbs[pid].zkdb.tree.F.toObject(
      dbs[pid].zkdb.tree.root,
    ).toString()
    const tx = await contract.commitRoot(hash)
    const receipt = await tx.wait()
    if (receipt.status) {
      dbs[pid].committed_height = dbs[pid].height
      console.log(`[${pid}]`, "hash committed!!", hash)
      dbs[pid].io_hb.put("committed_height", dbs[pid].committed_height)
    }
  }
  return { server, proof, update, proof_cid }
}

export default zkjson
