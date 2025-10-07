import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { getKV2, verify } from "./server-utils.js"
import { toAddr, httpsig_from, structured_to } from "hbsig"
import { mem, db as wdb, queue, io } from "wdb-core"
//import { mem, db as wdb, queue, io } from "../../core/src/index.js"
import { includes, map, fromPairs, isNil, without } from "ramda"
import { AR, AO } from "wao"
import { open } from "lmdb"
import recover from "./recover.js"
import wal from "./wal.js"
let dbs = {}
let ios = {}
let dbmap = {}
const _tags = tags => fromPairs(map(v => [v.name, v.value])(tags))

const server = async ({
  jwk,
  hb = "http://localhost:10001",
  dbpath,
  port = 6364,
  gateway = 5000,
  admin_only = true,
  hyperbeam = true,
}) => {
  const started_at = Date.now()
  const addr = (await new AR().init(jwk)).addr
  const app = express()
  const admin_io = dbpath ? open({ path: `${dbpath}/admin` }) : io()
  let pids = admin_io.get("pids") ?? []
  for (let v of pids) {
    console.log("recovering....", v)
    try {
      const { db: _db, io: _io } = await recover({ pid: v, hb, dbpath, jwk })
      //dbs[v] = _db
      if (dbpath) {
        const wkv = getKV2({ jwk, hb, dbpath, pid: v })
        dbs[v] = queue(wdb(wkv))
        ios[v] = _io
      } else {
        const { q, io } = mem()
        dbs[v] = q
        ios[v] = io
      }
      if (hyperbeam) wal({ jwk, hb, dbpath, pid: v })
    } catch (e) {
      console.log("recover failed:", v)
    }
  }
  app.use(cors())
  app.use(bodyParser.raw({ type: "*/*", limit: "100mb" }))
  app.get("/status", async (req, res) => {
    res.json({
      name: "WeaveDB",
      version: "0.1.0",
      operator: toAddr(jwk),
      processes: pids,
      started_at,
      "wal-url": hb,
      "wal-type": "HyperBEAM",
      status: "ok",
    })
  })
  app.get("/wal/:pid", async (req, res) => {
    const { pid } = req.params
    const { start, end, limit, order, offset } = req.query
    let obj = {}
    if (!isNil(start)) obj.start = ["__wal__", +start]
    if (!isNil(end)) obj.end = ["__wal__", +end]
    if (!isNil(offset)) obj.offset = +offset
    if (!isNil(limit)) obj.limit = +limit
    if (order === "desc") {
      obj.reverse = true
      if (isNil(start)) obj.start = ["__wal__", Infinity]
      if (isNil(end)) obj.end = ["__wal__", -1]
    } else {
      if (isNil(start)) obj.start = ["__wal__", 0]
      if (isNil(end)) obj.end = ["__wal__", Infinity]
    }
    let wal = []
    for (let v of ios[pid].getRange(obj)) wal.push(v)
    res.json({ wal })
  })
  app.get("/~weavedb@1.0/get", async (req, res) => {
    let query = []
    let id = null
    try {
      query = JSON.parse(req.headers.query ?? req.query.query)
      id = req.headers.id ?? req.query.id
      const _res = await dbs[id][query[0]](...query.slice(1)).val()
      res.json({ success: true, query, res: _res })
    } catch (e) {
      console.log(e)
      res.json({ success: false, query, error: e.toString() })
    }
  })
  app.post("/~weavedb@1.0/admin", async (req, res) => {
    const q = await verify(req)
    if (!q.valid || q.address !== toAddr(jwk)) {
      res.json({ success: false, error: "not authorized" })
    } else {
      const [op, opt] = q.query
      try {
        switch (op) {
          case "remove_db":
            if (!includes(opt.id, pids)) {
              res.json({ success: false, error: "db not found" })
            } else {
              pids = without([opt.id], admin_io.get("pids") ?? [])
              delete dbmap[opt.id]
              delete dbs[dbmap[opt.id]]
              delete dbs[opt.id]
              delete ios[opt.id]
              await admin_io.put("pids", pids)
              res.json({ success: true, processes: pids, error: null })
            }
            break
          default:
            res.json({ success: false, error: "operation not found" })
        }
      } catch (e) {
        res.json({ success: false, error: e.toString() })
      }
    }
  })
  app.post("/~weavedb@1.0/get", async (req, res) => {
    const q = await verify(req)
    if (q.valid) {
      try {
        let headers = {}
        for (const k in req.headers) {
          let lowK = k.toLowerCase()
          headers[lowK] = req.headers[lowK]
        }
        const _res = await dbs[headers.id]
          [q.query[0]](...q.query.slice(1))
          .val()
        res.json({ success: true, ...q, res: _res })
      } catch (e) {
        console.log(e)
        res.json({ success: false, ...q, error: e.toString() })
      }
    } else {
      res.json({ success: false, ...q })
    }
  })
  const toMsg = async req => {
    let msg = {}
    req?.headers?.forEach((v, k) => {
      msg[k] = v
    })
    if (req.body) msg.body = await req.text?.()
    return msg
  }
  app.post("/weavedb/:mid", async (req, res) => {
    const mid = req.params.mid
    const pid = req.query["process-id"]
    console.log(mid, pid)
    let data = null
    let msg = []
    try {
      if (!dbmap[pid]) {
        const res = await fetch(`${hb}/${pid}~process@1.0/compute?slot=0`)
        const msg = structured_to(httpsig_from(await toMsg(res)))
        const { db } = msg
        dbmap[pid] = db
      }
      const { assignment, message } = JSON.parse(req.body.toString()).edges[0]
        .node
      const tags_a = _tags(assignment.Tags)
      const tags_m = _tags(message.Tags)
      let query = null
      let id = null
      if (tags_m?.Query) query = JSON.parse(tags_m.Query)

      if (query) data = await dbs[dbmap[pid]].get(...query).val()
      if (tags_m["From-Process"]) {
        const r_tags = [
          { name: "Type", value: "Message" },
          { name: "Data-Protocol", value: tags_m["Data-Protocol"] },
          { name: "Variant", value: tags_m["Variant"] },
          { name: "X-Reference", value: tags_m["Reference"] },
          { name: "From-Process", value: pid },
        ]
        msg.push({
          Target: tags_m["From-Process"],
          Tags: r_tags,
          Data: data,
        })
        const ao = await new AO({ port: gateway }).init(jwk)
        const res = await ao.msg({
          pid: tags_m["From-Process"],
          data: JSON.stringify(data),
          act: null,
          tags: _tags(r_tags),
        })
      }
    } catch (e) {
      console.log(e)
    }
    res.json({ Output: { data }, Messages: msg })
  })

  app.post("/~weavedb@1.0/set", async (req, res) => {
    const { valid, query, fields, address } = await verify(req)
    if (valid) {
      try {
        const pid = req.headers.id
        let err = false
        if (query[0] === "init" && !dbs[pid]) {
          if (admin_only && addr !== address) {
            console.log(`not admin: ${addr}:${address}`)
            err = true
            res.json({
              success: false,
              error: "only node admin can add instances",
              result: null,
            })
          } else {
            console.log(`initializing a new db: ${pid}`)
            if (dbpath) {
              const wkv = getKV2({ jwk, hb, dbpath, pid })
              dbs[pid] = queue(wdb(wkv))
              ios[pid] = wkv.io
            } else {
              const { q, io } = mem()
              dbs[pid] = q
              ios[pid] = io
            }
            if (hyperbeam) wal({ jwk, hb, dbpath, pid })
            pids.push(pid)
            admin_io.put("pids", pids)
          }
        }
        if (!err) {
          if (!dbs[pid]) {
            res.json({ success: false, error: `db doesn't exist: ${pid}` })
          } else {
            if (typeof req.body?.toString === "function") {
              req.body = req.body.toString()
            }
            const _res = await dbs[pid].write(req)
            if (_res?.success) {
              res.json({ success: true, query, result: _res.result })
            } else {
              res.json({ success: false, error: _res.err, query, result: null })
            }
          }
        }
      } catch (e) {
        res.json({ success: false, query, error: e.toString(), result: null })
      }
    } else {
      res.json({
        success: false,
        error: "invalid signature",
        query,
        result: null,
      })
    }
  })

  const node = app.listen(port, () => console.log(`WeaveDB on port ${port}`))
  return {
    stop: () => {
      console.log("shutting down server...")
      node.close()
    },
  }
}

export default server
