import zlib from "zlib"
import { promisify } from "util"
const brotliCompress = promisify(zlib.brotliCompress)
const brotliDecompress = promisify(zlib.brotliDecompress)

import { init_query, getMsgs } from "./server-utils.js"
import { toAddr, httpsig_from, structured_to } from "hbsig"
import express from "express"
import { isNil, isEmpty, sortBy, prop, o, filter, map, fromPairs } from "ramda"
const _tags = tags => fromPairs(map(v => [v.name, v.value])(tags))
import cors from "cors"
import bodyParser from "body-parser"

import { resolve } from "path"
import {
  json as arjson,
  encode,
  Encoder,
  decode,
  Decoder,
  Parser,
} from "arjson"
//import { kv, db as wdb, queue } from "../../core/src/index.js"
import { kv, db as wdb, queue } from "wdb-core"
//import { DB } from "../../sdk/src/index.js"
import { DB } from "wdb-sdk"
import { verify } from "hbsig"
import { wait } from "wao/test"

import {
  ethers,
  Wallet,
  getDefaultProvider,
  Contract,
  JsonRpcProvider,
} from "ethers"
let zkhash = null
import { open } from "lmdb"

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

const getKV = ({ pid, dbpath }) => {
  const io = open({ path: `${dbpath}/kv/${pid}` })
  return kv(io, async c => {})
}

const genDir = () =>
  resolve(
    import.meta.dirname,
    `.db/mydb-${Math.floor(Math.random() * 1000000000)}`,
  )

let schemas = {}
const decodeBuf = async (_buf, sql, pid, dbpath, jwk, n = 1) => {
  const buf = await brotliDecompress(_buf)
  let update = false
  if (!dbs[pid].db) {
    const dbpath = genDir()
    const wkv = getKV({ dbpath, pid })
    const q = queue(wdb(wkv))
    dbs[pid].io = open({ path: `${dbpath}/cu/${pid}` })
    dbs[pid].db = new DB({ jwk, mem: q })
    await dbs[pid].db.init({ id: pid })
    dbs[pid].arjson = {} // Store arjson deltas per document
    dbs[pid].dirMetadata = {} // Cache for directory metadata
  }

  const q = Uint8Array.from(buf)
  const d = new Decoder()
  const left = d.decode(q, null)
  let json = d.json
  if (left[0].length !== 8) left.shift()
  let start = 0
  let changes = { dirs: {}, docs: {}, indexes: {} }

  for (let v of json) {
    const arr8 = frombits(left.slice(start, start + v[2]))
    start += v[2]
    const [dir, doc] = v[0].split("/")
    const key = v[0]
    if (sql) {
      try {
        const data = decode(arr8, d)
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
    // Handle arjson delta encoding
    if (dir === "_") {
      // Directory metadata needs delta storage for recovery
      const deltas = (await dbs[pid].io.get([key, "deltas"])) || []

      // Get old data before applying delta
      const oldData = dbs[pid].arjson[key]?.json() || null

      if (v[1] === 1) {
        // Initial full document
        deltas.push([0, arr8])
        dbs[pid].arjson[key] = arjson(deltas, undefined, n)
      } else {
        // Delta update
        deltas.push([1, arr8])
        dbs[pid].arjson[key] = arjson(deltas, undefined, n)
      }

      await dbs[pid].io.put([key, "deltas"], deltas)
      const newData = dbs[pid].arjson[key].json()

      if (!(dir === "_" && isNil(newData))) {
        await dbs[pid].io.put(v[0], newData)
      }

      // Track collection metadata with old and new data for later comparison
      if (!isNil(newData?.index)) {
        if (isNil(dbs[pid].cols[doc])) {
          dbs[pid].cols[doc] = newData.index
        }
        // Persist dirid→dirname mapping
        const mappings = (await dbs[pid].io.get("dirid_mappings")) || {}
        mappings[newData.index] = doc
        await dbs[pid].io.put("dirid_mappings", mappings)
        changes.dirs[doc] = {
          index: newData.index,
          oldData: oldData,
          newData: newData,
        }
        update = true
      }
    } else if (dir === "_config") {
      // Handle _config directory
      const deltas = (await dbs[pid].io.get([key, "deltas"])) || []

      // Get old data before applying delta
      const oldData = dbs[pid].arjson[key]?.json() || null

      if (v[1] === 1) {
        // Initial full document
        deltas.push([0, arr8])
        dbs[pid].arjson[key] = arjson(deltas, undefined, n)
      } else {
        // Delta update
        deltas.push([1, arr8])
        dbs[pid].arjson[key] = arjson(deltas, undefined, n)
      }

      await dbs[pid].io.put([key, "deltas"], deltas)
      const newData = dbs[pid].arjson[key].json()

      if (!isNil(newData)) {
        await dbs[pid].io.put(v[0], newData)
      }

      // Handle indexes_[dirid] documents
      if (/^indexes_\d+$/.test(doc)) {
        const dirid = doc.replace("indexes_", "")
        changes.indexes[dirid] = {
          oldData: oldData,
          newData: newData,
        }
        update = true
        console.log("indexes metadata for dirid", dirid, newData)
      }
    } else if (!/^_/.test(v[0])) {
      // Persist deltas to storage for recovery
      const deltas = (await dbs[pid].io.get([key, "deltas"])) || []

      if (v[1] === 1) {
        // Initial full document
        deltas.push([0, arr8])
        dbs[pid].arjson[key] = arjson(deltas, undefined, n)
      } else {
        // Delta update
        deltas.push([1, arr8])
        dbs[pid].arjson[key] = arjson(deltas, undefined, n)
      }

      await dbs[pid].io.put([key, "deltas"], deltas)
      const currentData = dbs[pid].arjson[key].json()

      update = true
      console.log(`[${pid}]`, "added to zk tree", dir, doc, currentData)
      changes.docs[dir] ??= {}
      changes.docs[dir][doc] = currentData
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

  for (let dir of _dirs) {
    console.log("mkdir", dir)
    await dbs[pid].db.mkdir({
      name: dir.name,
      auth: [["add:add,set:set,update:update,del:del", [["allow()"]]]],
    })
  }

  // Handle index operations from _config/indexes_[dirid]
  for (let dirid in changes.indexes) {
    const indexData = changes.indexes[dirid]
    const oldIndexes = indexData.oldData?.indexes || []
    const newIndexes = indexData.newData?.indexes || []

    // Find the directory name from dirid
    let dirName = null
    for (let k in changes.dirs) {
      if (changes.dirs[k].index === parseInt(dirid)) {
        dirName = k
        break
      }
    }

    // If directory not in current changes, check cached cols
    if (!dirName) {
      for (let k in dbs[pid].cols) {
        if (dbs[pid].cols[k] === parseInt(dirid)) {
          dirName = k
          break
        }
      }
    }

    // If still not found, load from persistent storage
    if (!dirName) {
      dirName = await dbs[pid].io.get(["dirid_map", parseInt(dirid)])
    }

    if (dirName && dirName[0] !== "_") {
      // Convert to Set for comparison
      const oldIndexSet = new Set(oldIndexes.map(idx => JSON.stringify(idx)))
      const newIndexSet = new Set(newIndexes.map(idx => JSON.stringify(idx)))

      // Find removed indexes
      for (const oldIdx of oldIndexes) {
        const idxKey = JSON.stringify(oldIdx)
        if (!newIndexSet.has(idxKey)) {
          console.log("removeIndex", dirName, oldIdx)
          console.log(await dbs[pid].db.removeIndex(oldIdx, dirName))
        }
      }

      // Find added indexes
      for (const newIdx of newIndexes) {
        const idxKey = JSON.stringify(newIdx)
        if (!oldIndexSet.has(idxKey)) {
          console.log("addIndex", dirName, newIdx)
          await dbs[pid].db.addIndex(newIdx, dirName)
          console.log(await dbs[pid].db.get("users", ...newIdx))
        }
      }

      if (newIndexes.length > 0) {
        if (!dbs[pid].indexes) dbs[pid].indexes = {}
        dbs[pid].indexes[dirName] = newIndexes
        console.log("indexes for", dirName, newIndexes)
      }
    }
  }

  for (let k in changes.docs) {
    const dir = changes.docs[k]
    for (let k2 in dir) {
      if (k[0] !== "_") {
        const doc = dir[k2]
        console.log(k, k2, doc, typeof doc)
        if (doc === null) {
          console.log("delete doc", k, k2)
          await dbs[pid].db.set("del:del", k, k2)
        } else if (typeof doc === "object" && doc !== null) {
          console.log("set doc", k, k2, doc)
          await dbs[pid].db.set("set:set", doc, k, k2)
        } else {
          console.log("unknown:", k2, doc)
        }
      }
    }
  }
  return update
}

let server = null
let update = null

const addServer = ({ port }) => {}
const startServer = ({ port }) => {
  app = express()
  app.use(cors())
  app.use(bodyParser.json())
  app.post("/weavedb/:mid", async (req, res) => {
    const mid = req.params.mid
    const pid = req.query["process-id"]
    console.log(mid, pid)
    let data = null
    let msg = []
    let done = false
    try {
      const { assignment, message } = req.body.edges[0].node
      const tags_a = _tags(assignment.Tags)
      const tags_m = _tags(message.Tags)
      let query = null
      let id = null
      const slot = req.body.edges[0].cursor
      let timeout = false
      const to = setTimeout(() => {
        if (!done) {
          timeout = true
          res.status(500)
          res.json({ error: "timeout" })
        }
      }, 10000)
      await update(pid, slot, r => {
        if (!timeout) {
          done = true
          const { error, res: res2 } = r
          data = res2
          if (error) {
            res.status(500)
            res.json({ error: "unknown error" })
          } else res.json({ Output: { data }, Messages: msg })
        }
      })
    } catch (e) {
      console.log(e)
      if (!done) {
        res.status(500)
        res.json({ error: "unknown error" })
      }
    }
  })

  return app.listen(port, () => console.log(`CU on port ${port}`))
}

let qs = {}
let ongoing = {}
export default async ({
  dbpath,
  hb = "http://localhost:10001",
  pid,
  sql,
  port = 6366,
  dbpath_hb,
  jwk,
  n = 1,
}) => {
  update = async (pid, slot, cb, force) => {
    console.log("update.........", slot, pid, force)
    qs[pid] ??= {}
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
        indexes: {},
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
    // Load dirid→dirname mappings on startup
    if (dbs[pid].io) {
      const storedMappings = await dbs[pid].io.get("dirid_mappings")
      if (storedMappings) {
        for (const [dirid, dirname] of Object.entries(storedMappings)) {
          dbs[pid].cols[dirname] = parseInt(dirid)
        }
        console.log(`[${pid}]`, "Loaded dirid mappings:", storedMappings)
      }
    }
    if (!isNil(slot) && cb) {
      const r = dbs[pid].io_hb.get(["result", slot])
      if (r) cb(r)
      else {
        qs[pid][slot] ??= []
        console.log("putting....", slot, ongoing[pid])
        qs[pid][slot].push(cb)
      }
    }
    let res = null
    let to = 0
    let plus = 10
    if (exists > dbs[pid].height) {
      plus = 1
      res = { assignments: {} }
      for (let i = dbs[pid].height + 1; i <= exists; i++) {
        res.assignments[Number(i).toString()] = dbs[pid].io_hb.get(["data", i])
        to = i
        plus += 1
      }
    }
    let proof = null
    if (ongoing[pid] !== true || force) {
      console.log("ongoing go.................")
      ongoing[pid] = true
      try {
        if (res === null) {
          if (dbs[pid].height) dbs[pid].from = dbs[pid].height + 1
          to = dbs[pid].from + (plus - 1)
          res = await getMsgs({ pid, hb, from: dbs[pid].from, to })
        }

        let update = false
        while (!isEmpty(res.assignments)) {
          for (let k in res.assignments ?? {}) {
            const m = res.assignments[k]
            if (dbs[pid].io_hb) await dbs[pid].io_hb.put(["data", m.slot], m)
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
                const buf = m.body.data
                if (await decodeBuf(buf, sql, pid, dbpath, jwk, n))
                  update = true
              } else if (m.body.action === "Query") {
                let query = null
                let msg = null
                try {
                  query = JSON.parse(m.body.query)
                  const res = await dbs[pid].db.get(...query)
                  console.log(`query [${m.slot}]`, query, res)
                  msg = { res: res, error: null, query }
                  await dbs[pid].io_hb.put(["result", m.slot], msg)
                  if (qs[pid][m.slot]) {
                    for (const v of qs[pid][m.slot]) {
                      try {
                        v(msg)
                      } catch (e) {}
                    }
                    delete qs[pid][m.slot]
                  }
                } catch (e) {
                  await dbs[pid].io_hb.put(["result", m.slot], {
                    res: null,
                    error: e.toString(),
                    query,
                  })
                }
              }
            }
            dbs[pid].height = m.slot
          }
          await dbs[pid].io_hb.put("height", dbs[pid].height)
          dbs[pid].from += plus
          to = dbs[pid].from + plus
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

        dbs[pid].proof ??= proof
        if (!isEmpty(qs[pid])) update(null, null, null, true)
        ongoing[pid] = false
      } catch (e) {
        console.log(e)
        ongoing[pid] = false
      }
      return { server, proof, update }
    }
  }
  if (port && !server) {
    server = startServer({ port })
    addServer({ port })
  }
  return pid ? await update(pid) : { server }
}
