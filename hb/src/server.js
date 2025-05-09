import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { verify } from "./server-utils.js"
import wdb from "./index.js"
import kv from "./kv.js"
import { open } from "lmdb"
import { resolve } from "path"

const getKV = () => {
  const io = open({
    path: resolve(
      import.meta.dirname,
      `.db/weavedb-${Math.floor(Math.random() * 10000)}`,
    ),
  })
  return kv(io, c => {})
}

const wkv = getKV()
const db = wdb(wkv).init({ from: "me", id: "db-1" })
const port = 4000

const server = () => {
  const app = express()
  app.use(cors())
  app.use(bodyParser.raw({ type: "*/*", limit: "100mb" }))

  app.get("/~weavedb@1.0/get", async (req, res) => {
    const q = await verify(req)
    if (q.valid) {
      try {
        const _res = db.get(...q.query)
        console.log(_res)
        res.json({ success: true, ...q, res: _res })
      } catch (e) {
        res.json({ success: false, ...q, error: e.toString() })
      }
    } else {
      res.json({ success: false, ...q })
    }
  })

  app.post("/~weavedb@1.0/set", async (req, res) => {
    const q = await verify(req)
    if (q.valid) {
      try {
        db.set(...q.query)
        res.json({ success: true, ...q })
      } catch (e) {
        res.json({ success: false, ...q, error: e.toString() })
      }
    } else {
      res.json({ success: false, ...q })
    }
  })

  const node = app.listen(port, () => console.log(`WeaveDB on port ${port}`))
  return { stop: () => node.close() }
}

export default server
