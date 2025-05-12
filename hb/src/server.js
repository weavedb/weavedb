import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { getKV, verify } from "./server-utils.js"
import wdb from "./index.js"
import kv from "./kv.js"
import { resolve } from "path"
import { includes } from "ramda"
import { AR } from "wao"

const server = async ({ jwk, hb, dbpath, port = 4000, pid }) => {
  const wkv = getKV({ jwk, hb, dbpath, pid })
  const addr = (await new AR().init(jwk)).addr
  const db = wdb(wkv)
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
    const { valid, query, fields } = await verify(req)
    if (valid) {
      try {
        let headers = {}
        for (const k in req.headers) {
          let lowK = k.toLowerCase()
          if (includes(lowK, [...fields, "signature", "signature-input"])) {
            headers[lowK] = req.headers[lowK]
          }
        }
        console.log(headers)
        db.set(...query, headers)
        res.json({ success: true, query })
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
