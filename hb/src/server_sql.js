import express from "express"
import { DatabaseSync } from "node:sqlite"
import cors from "cors"
import bodyParser from "body-parser"
import { getKV, verify } from "./server-utils.js"
import sql from "./sql.js"
import queue from "../src/queue.js"
import kv from "./kv.js"
import { resolve } from "path"
import { includes, map, fromPairs } from "ramda"
import { AR, AO } from "wao"
import { open } from "lmdb"
import recover from "../src/recover.js"
let dbs = {}
let dbmap = {}
const _tags = tags => fromPairs(map(v => [v.name, v.value])(tags))

const server = async ({
  jwk,
  hb,
  dbpath,
  port = 6363,
  gateway = 5000,
  admin_only = true,
}) => {
  const addr = (await new AR().init(jwk)).addr
  const app = express()
  const io = open({ path: `${dbpath}-admin` })
  let pids = io.get("pids") ?? []
  for (let v of pids) {
    console.log("recovering....", v)
    dbs[v] = await recover({ pid: v, hb, dbpath: `${dbpath}-${v}`, jwk })
  }
  app.use(cors())
  app.use(bodyParser.raw({ type: "*/*", limit: "100mb" }))

  app.get("/~weavedb@1.0/get", async (req, res) => {
    const q = await verify(req)
    if (q.valid) {
      try {
        let headers = {}
        for (const k in req.headers) {
          let lowK = k.toLowerCase()
          headers[lowK] = req.headers[lowK]
        }
        const _res = dbs[headers.id].sql(q.query[0]).val()
        res.json({ success: true, ...q, res: _res })
      } catch (e) {
        console.log(e)
        res.json({ success: false, ...q, error: e.toString() })
      }
    } else {
      res.json({ success: false, ...q })
    }
  })

  app.post("/result/:mid", async (req, res) => {
    const mid = req.params.mid
    const pid = req.query["process-id"]
    let data = null
    if (!dbmap[pid]) {
      const json = await fetch(
        `${hb}/${pid}~process@1.0/compute/serialize~json@1.0?slot=0`,
      ).then(r => r.json())
      const {
        process: { db },
      } = json
      dbmap[pid] = db
    }
    let msg = []
    try {
      const { assignment, message } = JSON.parse(req.body.toString()).edges[0]
        .node
      const tags_a = _tags(assignment.Tags)
      const tags_m = _tags(message.Tags)
      let query = null
      let id = null
      if (tags_m?.Query) query = JSON.parse(tags_m.Query)
      if (query) data = dbs[dbmap[pid]].sql(...query).val()
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
            })
          } else {
            console.log(`initializing a new db: ${pid}`)
            const wkv = getKV({ jwk, hb, dbpath, pid })
            const _sql = new DatabaseSync(`${dbpath}.sql`)
            dbs[pid] = queue(sql(wkv, { sql: _sql }))
            pids.push(pid)
            io.put("pids", pids)
          }
        }
        if (!err) {
          if (!dbs[pid]) {
            res.json({ success: false, error: `db doesn't exist: ${pid}` })
          } else {
            const _res = await dbs[pid].write(req)
            if (_res?.success) {
              res.json({ success: true, query })
            } else {
              res.json({ success: false, error: _res.err, query })
            }
          }
        }
      } catch (e) {
        res.json({ success: false, query, error: e.toString() })
      }
    } else {
      res.json({ success: false, query })
    }
  })

  const node = app.listen(port, () => console.log(`WeaveDB on port ${port}`))
  return { stop: () => node.close() }
}

export default server
