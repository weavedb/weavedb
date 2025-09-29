import express from "express"
import { createData } from "@dha-team/arbundles"
import { toAddr, tags } from "wao/utils"
import { DataItem } from "@dha-team/arbundles"
import { ArweaveSigner } from "@ar.io/sdk"
import { HB } from "wao"
let procs = []
let msgs = {}
let ongoing = {}
import { open } from "lmdb"
export default class SU {
  constructor({
    port = 4003,
    jwk,
    db = "http://localhost:6364",
    hb = "http://localhost:10001",
    mu = "https://mu.ao-testnet.xyz",
    bundler = "https://up.arweave.net:443/tx",
    dbpath,
  }) {
    this.io = open({ path: dbpath })
    this.hb = new HB({ format: "ans104", jwk })
    this.jwk = jwk
    this.bundler = bundler
    this.mu = mu
    this.port = port
    const app = express()
    this.app = app
    const signer = new ArweaveSigner(jwk)
    this.signer = signer
    app.use(express.raw({ type: "*/*", limit: "10mb" }))
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
      next()
    })

    app.get("/", async (req, res) => {
      res.json({
        Unit: "Scheduler",
        Timestamp: Date.now(),
        Address: toAddr(jwk.n),
        Processes: [],
      })
    })

    app.post("/", async (req, res) => {
      const di = new DataItem(req.body)
      const _tags = tags(di.tags)
      if (!_tags["Query"] || !_tags["From-Process"] || !_tags["Reference"]) {
        console.log("wrong query:", di.id)
        res.status(400)
        res.send({ id: di.id })
        return
      }
      const id = `${_tags["From-Process"]}:${_tags["Reference"]}`
      if (msgs[id]?.done || ongoing[id]) {
        res.status(201)
        res.send({ id: di.id })
        console.log("duplicate:", id)
        return
      }
      const exists = this.io.get(id)
      if (exists?.done || ongoing[id]) {
        msgs[id] = exists
        res.status(201)
        res.send({ id: di.id })
        console.log("duplicate:", id)
        return
      }
      console.log()
      console.log("new: ", id)
      console.log(_tags)
      ongoing[id] = true
      msgs[id] ??= { item: di }
      let _data = null
      let slot = null
      if (msgs[id].reply !== true) {
        try {
          const res2 = await this.hb.send104({
            path: `/${di.target}/schedule`,
            item: di,
          })
          if (res2?.status === 200) {
            slot = res2.out.slot
            const {
              results: { data },
            } = await this.hb.compute({ pid: di.target, slot })
            if (typeof data !== "undefined") _data = data
          }
          msgs[id].reply = true
          msgs[id].data = _data
          msgs[id].slot = slot
          await this.io.put(id, msgs[id])
          res.status(201)
          res.send({ id: di.id })
        } catch (e) {
          console.log(e)
          res.status(500)
          res.send({ id: di.id })
        }
      } else {
        res.status(201)
        res.send({ id: di.id })
        _data = msgs[id].data
        slot = msgs[id].slot
      }
      try {
        if (this.bundler && msgs[id].ar !== true) await this.toArweave(di, id)
      } catch (e) {
        console.log(e)
      }
      try {
        if (msgs[id].aos !== true) {
          const di2 = createData(JSON.stringify(_data), signer, {
            target: _tags["From-Process"],
            tags: [
              { name: "Data-Protocol", value: "ao" },
              { name: "Variant", value: "ao.TN.1" },
              {
                name: "From-Process",
                value: di.target,
              },
              { name: "Type", value: "Message" },
              { name: "X-Reference", value: _tags["Reference"] },
              { name: "Reference", value: Number(slot).toString() },
              { name: "Query", value: _tags.Query },
            ],
          })
          await this.toAOS(di2, id)
        }
      } catch (e) {
        console.log(e)
      }
      if (
        msgs[id].done !== true &&
        msgs[id].aos &&
        msgs[id].reply &&
        msgs[id].ar
      ) {
        msgs[id].done = true
        await this.io.put(id, msgs[id])
      }
      delete ongoing[id]
    })
    app.listen(port, () => console.log(`Server is running on port ${port}`))
  }
  async toArweave(di, id) {
    const res = await fetch(this.bundler, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: di.binary,
    })
    const _tags = tags(di.tags)
    console.log(`Arweave[${id}]: ${res.status}: ${_tags.Query}`)
    if (res.status === 200) msgs[id].ar = true
    else msgs[id].ar_error = res.status ?? 1
    await this.io.put(id, msgs[id])
  }
  async toAOS(di, id) {
    await di.sign(this.signer)
    const _tags = tags(di.tags)
    const res = await fetch(this.mu, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: di.binary,
    })
    console.log(`AOS[${id}]: ${res.status}: ${_tags.Query}`)
    if (res.status === 202) msgs[id].aos = true
    else msgs[id].aos_error = res?.status ?? 1
    await this.io.put(id, msgs[id])
  }
  stop() {
    console.log(`SU is shutting down...`)
    this.app.close()
  }
}
