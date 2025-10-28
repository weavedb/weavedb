import express from "express"
import { Validator } from "./validate.js"
import cors from "cors"
import bodyParser from "body-parser"
import { verify } from "./server-utils.js"
import { toAddr } from "hbsig"
import { HB } from "wao"
import { resolve } from "path"

let dbs = {}

const get = async val => {
  try {
    console.log("get:", await val.get())
  } catch (e) {
    console.log(e)
  }
  setTimeout(() => get(val), 10000)
}
const write = async val => {
  try {
    console.log("write:", await val.write())
  } catch (e) {
    console.log(e)
  }
  setTimeout(() => write(val), 10000)
}
const commit = async val => {
  try {
    console.log("commit:", await val.commit())
  } catch (e) {
    console.log(e)
  }
  setTimeout(() => commit(val), 10000)
}

export default ({
  jwk,
  hb = "http://localhost:10001",
  dbpath,
  port = 6367,
}) => {
  const started_at = Date.now()
  const app = express()
  app.use(cors())
  app.use(bodyParser.raw({ type: "*/*", limit: "100mb" }))
  app.get("/", async (req, res) => {
    let _dbs = []
    for (let k in dbs) _dbs.push({ id: k, sst: dbs[k].vid })
    res.json({ started_at, dbs: _dbs, validator: toAddr(jwk.n) })
  })
  app.get("/spawn", async (req, res) => {
    let { id: pid, vid } = req.query
    if (dbs[pid]) {
      res.json({ success: false, err: `validator exists: ${dbs[pid].vid}` })
    } else {
      let err = null
      try {
        const _hb = new HB({ jwk, url: hb, format: "ans104" })
        if (!vid) {
          console.log("spawning...", pid)
          const { pid: _vid } = await _hb.spawn({
            nonce: 1,
            "data-protocol": "ao",
            variant: "ao.TN.1",
            "execution-device": "weavedb@1.0",
            db: pid,
          })
          console.log(_vid)
          if (!_vid) throw Error("failed to spawn")
          else {
            vid = _vid
            dbs[pid] = { vid }
          }
        }
        console.log(`dbpath: ${dbpath}`)
        console.log(`vid: ${vid}`)
        console.log()
        dbs[pid].val = await new Validator({
          jwk,
          pid,
          dbpath,
          vid,
          hb,
          autosync: 3000,
        }).init()
      } catch (e) {
        err = e
      }
      if (err) {
        res.json({ success: false, err: err.toString() })
      } else {
        get(dbs[pid].val)
        write(dbs[pid].val)
        commit(dbs[pid].val)
        res.json({ success: true, vid })
      }
    }
  })
  const node = app.listen(port, () => console.log(`Validator on port ${port}`))
  return {
    stop: () => {
      console.log("shutting down server...")
      node.close()
    },
  }
}
