import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { verify } from "./server-utils.js"
import { toAddr } from "hbsig"
import { Core, mem, io } from "wdb-core"
import { includes, map, fromPairs, isNil, without } from "ramda"
import { open } from "lmdb"
import recover from "./recover.js"
import wal from "./wal.js"
let dbs = {}
let ios = {}
let dbmap = {}
let vals = {}

const server = async ({
  jwk,
  hb = "http://localhost:10001",
  dbpath,
  port = 6364,
  gateway = "https://arweave.net",
  admin_only = true,
  hyperbeam = true,
  validator = "http://localhost:6367",
}) => {
  const started_at = Date.now()
  const addr = toAddr(jwk)
  const app = express()
  const admin_io = dbpath ? open({ path: `${dbpath}/admin` }) : io()
  let pids = admin_io.get("pids") ?? []
  for (let v of pids) {
    console.log("recovering....", v)
    try {
      const { db: _db, io: _io } = await recover({
        gateway,
        pid: v,
        hb,
        dbpath,
        jwk,
      })
      console.log("recoverd!", v)
      dbs[v] = _db
      ios[v] = _io
      if (hyperbeam) wal({ jwk, hb, dbpath, pid: v })
      if (validator) {
        try {
          const res = await fetch(`${validator}/spawn?id=${v}`).then(r =>
            r.json(),
          )
          if (res.success) vals[v] = res.vid
        } catch (e) {}
      }
    } catch (e) {
      console.log(e)
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
      res.json(await dbs[id][query[0]](query.slice(1)))
    } catch (e) {
      console.log(e)
      res.json({ success: false, query, err: e.toString() })
    }
  })

  app.post("/~weavedb@1.0/admin", async (req, res) => {
    const q = await verify(req)
    if (!q.valid || q.address !== toAddr(jwk)) {
      res.json({ success: false, err: "not authorized" })
    } else {
      const [op, opt] = q.query
      try {
        switch (op) {
          case "remove_db":
            if (!includes(opt.id, pids)) {
              res.json({ success: false, err: "db not found" })
            } else {
              pids = without([opt.id], admin_io.get("pids") ?? [])
              delete dbmap[opt.id]
              delete dbs[dbmap[opt.id]]
              delete dbs[opt.id]
              delete ios[opt.id]
              await admin_io.put("pids", pids)
              res.json({ success: true, processes: pids, err: null })
            }
            break
          default:
            res.json({ success: false, err: "operation not found" })
        }
      } catch (e) {
        res.json({ success: false, err: e.toString() })
      }
    }
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
              err: "only node admin can add instances",
              res: null,
            })
          } else {
            console.log(`initializing a new db: ${pid} by ${address}`)
            if (dbpath) {
              const io = open({ path: `${dbpath}/${pid}` })
              const [op, { version }] = JSON.parse(req.headers.query)
              let opt = {}
              if (version) opt.version = version
              const core = await new Core({ io, gateway }).init(opt)
              dbs[pid] = core.db
              ios[pid] = io
            } else {
              const { q, io } = mem()
              dbs[pid] = q
              ios[pid] = io
            }
            if (hyperbeam) wal({ jwk, hb, dbpath, pid })
            pids.push(pid)
            admin_io.put("pids", pids)
            if (validator) {
              try {
                const res = await fetch(`${validator}/spawn?id=${pid}`).then(
                  r => r.json(),
                )
                if (res.success) vals[pid] = res.vid
              } catch (e) {}
            }
          }
        }
        if (!err) {
          if (!dbs[pid]) {
            res.json({ success: false, err: `db doesn't exist: ${pid}` })
          } else {
            if (typeof req.body?.toString === "function") {
              req.body = req.body.toString()
            }
            const _res = await dbs[pid].write(req)
            if (_res?.success) {
              res.json({ success: true, query, res: _res.result })
            } else {
              res.json({ success: false, err: _res.err, query, res: null })
            }
          }
        }
      } catch (e) {
        res.json({ success: false, query, err: e.toString(), res: null })
      }
    } else {
      res.json({
        success: false,
        err: "invalid signature",
        query,
        res: null,
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
