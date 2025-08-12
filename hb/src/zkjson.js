import { getMsgs } from "./server-utils.js"
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import abi from "./zkdb_ab.js"
import { isNil, isEmpty } from "ramda"
import { resolve } from "path"
import {
  ethers,
  Wallet,
  getDefaultProvider,
  Contract,
  JsonRpcProvider,
} from "ethers"
let zkhash = null
import { open } from "lmdb"
import { DB as ZKDB } from "zkjson"
let zkdb = null
let cols = {}
let io = null
let io_hb = null
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
const decodeBuf = async (buf, sql) => {
  let update = false
  if (!zkdb) {
    zkdb = new ZKDB({
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
    if (sql) {
      try {
        if (/^_\//.test(v[0])) {
          if (v[0].split("/")[1][0] !== "_") {
            const table_name = v[0].split("/")[1]
            console.log("add table:", table_name)
            schemas[table_name] = { primary: data.primary, schema: data.schema }
            sql.exec(schema2sql(data.schema, data.primary, data.auto_inc))
          }
        } else if (!/^_/.test(v[0])) {
          const table_name = v[0].split("/")[0]
          console.log("add data:", v[0], data)
          const schema = schemas[table_name]
          const insert = toInsert(schema.schema, data, schema.primary)
          sql.exec(insert)
        }
      } catch (e) {
        console.log(e)
      }
    }

    const [dir, doc] = v[0].split("/")
    if (!(dir === "_" && isNil(data))) await io.put(v[0], data)
    if (dir === "_" && !isNil(data?.index) && isNil(cols[doc])) {
      cols[doc] = data.index
      update = true
      await zkdb.addCollection(data.index)
    }
    try {
      await zkdb.insert(cols[dir], doc, data)
      update = true
      console.log("added to zk tree", dir, doc, data)
      //const hash = zkdb.tree.F.toObject(zkdb.tree.root).toString()
    } catch (e) {
      console.log(e)
      console.log("zk error", data)
    }
  }
  return update
}

const startServer = ({ port, proof }) => {
  const app = express()
  app.use(cors())
  app.use(bodyParser.json())
  app.post("/zkp", async (req, res) => {
    let zkp = null
    let success = false
    let error = null
    let dirid = null
    try {
      zkp = await proof(req.body)
      dirid = io.get(`_/${req.body.dir}`)?.index
      success = true
    } catch (e) {
      console.log(e)
      error = e.toString()
    }
    const toInt = base64 => {
      const buffer = Buffer.from(base64, "base64")
      let result = 0n
      for (const byte of buffer) {
        result = (result << 8n) | BigInt(byte)
      }
      return result.toString()
    }
    const hash = zkdb.tree.F.toObject(zkdb.tree.root).toString()
    res.json({
      success,
      zkp,
      error,
      query: req.body,
      zkhash: toInt(zkhash),
      dirid,
    })
  })
  return app.listen(port, () => console.log(`ZK Prover on port ${port}`))
}

let i = 0
let from = 0
let height = -1
let committed_height = -1
let server = null
// preserve zkdb state somehow and continue
const zkjson = async ({
  dbpath,
  hb,
  pid,
  sql,
  port,
  dbpath_hb,
  commit,
  alchemy_key,
  priv_key,
}) => {
  io ??= open({ path: dbpath })
  io_hb ??= open({ path: dbpath_hb })
  const exists = io_hb.get("height") ?? -1
  if (committed_height === -1) {
    committed_height = io_hb.get("committed_height") ?? -1
  }
  let res = null
  let to = 0
  let plus = 100
  if (exists > height) {
    plus = 1
    res = { assignments: {} }
    for (let i = height + 1; i <= exists; i++) {
      res.assignments[Number(i).toString()] = io_hb.get(["data", i])
      to = i
      plus += 1
    }
  }
  if (res === null) {
    if (height) {
      from = height + 1
      i = height + 1
    }
    to = from + 99

    res = await getMsgs({ pid, hb, from, to })
  }
  let update = false
  while (!isEmpty(res.assignments)) {
    for (let k in res.assignments ?? {}) {
      const m = res.assignments[k]
      console.log(m)
      if (io_hb) {
        io_hb.put(["data", m.slot], m)
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
          const buf = Buffer.from(m.body.data, "base64")
          if (await decodeBuf(buf, sql)) update = true
        }
      }
      height = m.slot
    }
    io_hb.put("height", height)
    from += plus
    to = from + 100
    console.log("height", height, "from:", from, "to:", to)
    res = await getMsgs({ pid, hb, from, to })
  }
  const proof = async ({ dir, doc, path, query }) => {
    const col_id = cols[dir]
    const json = io.get(`${dir}/${doc}`)
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
      params.id,
      params.query ? JSON.stringify(params.query) : null,
    ]
    console.log("generating zkp...", dir, doc)
    console.log(params)
    const zkp = io.get(key) ?? (await zkdb.genProof(params))
    io.put(key, zkp)
    return zkp
  }
  if (port && !server) server = startServer({ port, proof })
  if (update && commit && committed_height < height) {
    console.log("committing hash...", commit)
    const provider = new JsonRpcProvider(
      `https://eth-sepolia.g.alchemy.com/v2/${alchemy_key}`,
    )
    const wallet = new Wallet(priv_key, provider)
    const contract = new ethers.Contract(commit, abi, wallet)
    const hash = zkdb.tree.F.toObject(zkdb.tree.root).toString()
    const tx = await contract.commitRoot(hash)
    const receipt = await tx.wait()
    if (receipt.status) {
      committed_height = height
      console.log("hash committed!!", hash)
      io_hb.put("committed_height", committed_height)
    }
  }
  return { server, proof, update }
}

export default zkjson
