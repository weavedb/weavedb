import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { getKV, verify } from "./server-utils.js"
import wdb from "./index.js"
import queue from "../src/queue.js"
import kv from "./kv.js"
import { resolve } from "path"
import { includes } from "ramda"
import { AR } from "wao"
import { open } from "lmdb"
import recover from "../src/recover.js"
let dbs = {}
const server = async ({ jwk, hb, dbpath, port = 4000 }) => {
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
        const _res = dbs[headers.id].get(...q.query)
        res.json({ success: true, ...q, res: _res })
      } catch (e) {
        res.json({ success: false, ...q, error: e.toString() })
      }
    } else {
      res.json({ success: false, ...q })
    }
  })

  app.post("/~weavedb@1.0/set", async (req, res) => {
    const { valid, query, fields, address } = await verify(req)
    if (valid) {
      try {
        let headers = {}
        for (const k in req.headers) {
          let lowK = k.toLowerCase()
          if (includes(lowK, [...fields, "signature", "signature-input"])) {
            headers[lowK] = req.headers[lowK]
          }
        }
        const pid = headers.id
        if (query[0] === "init" && !dbs[pid]) {
          if (addr !== address) {
            res.json({
              success: false,
              error: "only node admin can add instances",
            })
          } else {
            console.log(`initializing a new db: ${pid}`)
            const wkv = getKV({ jwk, hb, dbpath, pid })
            dbs[pid] = queue(wdb(wkv))
            pids.push(pid)
            io.put("pids", pids)
          }
        }
        if (!dbs[pid]) {
          res.json({ success: false, error: `db doesn't exist: ${pid}` })
        } else {
          await dbs[pid].set(...query, headers)
          res.json({ success: true, query })
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
