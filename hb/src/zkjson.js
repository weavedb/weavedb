import { getMsgs } from "./server-utils.js"
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"

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
      await zkdb.addCollection(data.index)
    }
    /*
    if (isNil(cols[dir])) {
      console.log("why nothing...", cols, dir)
      // todo: dir schema and auth omitted due to data size
      const index = io.get(`_/${dir}`).index
      cols[dir] = index
      await zkdb.addCollection(index)
    }*/
    try {
      await zkdb.insert(cols[dir], doc, data)
      console.log("added to zk tree", dir, doc, data)
    } catch (e) {
      console.log(e)
      console.log("zk error", data)
    }
  }
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
    //const hash = zkdb.tree.F.toObject(zkdb.tree.root).toString()
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
let height = null
let server = null
// preserve zkdb state somehow and continue
const zkjson = async ({ dbpath, hb, pid, sql, port }) => {
  if (height) {
    from = height + 1
    i = height + 1
  }
  let to = from + 99
  let res = await getMsgs({ pid, hb, from, to })
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
        if (m.body.zkhash) {
          zkhash = m.body.zkhash
          const buf = Buffer.from(m.body.data, "base64")
          await decodeBuf(buf, sql)
        }
      }
      height = +k
    }
    from += 100
    to += 100
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
    return await zkdb.genProof(params)
  }
  if (port && !server) server = startServer({ port, proof })
  return { server, proof }
}

export default zkjson
