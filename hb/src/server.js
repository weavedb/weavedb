import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { verify } from "./server-utils.js"
import wdb from "./index.js"
import kv from "./kv.js"
import { open } from "lmdb"
import { resolve } from "path"
import { includes } from "ramda"
import { connect, createSigner } from "@permaweb/aoconnect"

const getKV = ({ jwk, pid, hb, dbpath }) => {
  let request = null
  if (jwk && hb) {
    ;({ request } = connect({
      MODE: "mainnet",
      URL: hb,
      device: "",
      signer: createSigner(jwk),
    }))
  }
  const io = open({ path: dbpath })
  let addr = null
  return kv(io, async c => {
    let bundle = []
    for (const d of c.data) {
      if (d.opt && typeof d.opt === "object" && d.opt["signature"]) {
        bundle.push(d.opt)
      }
    }
    if (bundle.length > 0) {
      if (request && pid) {
        if (!addr) {
          const txt = await fetch(
            `${hb}/~meta@1.0/info/serialize~json@1.0`,
          ).then(r => r.json())
          addr = txt.address
        }
        const tags = {
          method: "POST",
          path: `/${pid}/schedule`,
          scheduler: addr,
          data: JSON.stringify(bundle),
        }
        const res = await request(tags)
        console.log(`[${res.slot}] ${res.process}`)
      }
    }
  })
}

const server = ({ jwk, hb, dbpath, port = 4000, pid }) => {
  const wkv = getKV({ jwk, hb, dbpath, pid })
  const db = wdb(wkv).init({ from: "me", id: "db-1" })
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
