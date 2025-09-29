import express from "express"
import { createData } from "@dha-team/arbundles"
import { toAddr, tags } from "wao/utils"
import { DataItem } from "@dha-team/arbundles"
import { ArweaveSigner } from "@ar.io/sdk"
import { HB } from "wao"
let procs = []
let msgs = {}
export default class SU {
  constructor({
    port = 4003,
    jwk,
    db = "http://localhost:6364",
    hb = "http://localhost:10001",
    mu = "https://mu.ao-testnet.xyz",
    bundler = "https://up.arweave.net:443/tx",
  }) {
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
      console.log(di.id, _tags)
      if (msgs[di.id]) {
        console.log("duplicate:", di.id)
        return
      }
      msgs[di.id] = di
      res.status(201)
      let slot = null
      let _data = null
      try {
        const res = await this.hb.send104({
          path: `/${di.target}/schedule`,
          item: di,
        })
        if (res?.status === 200) {
          slot = res.out.slot
          const {
            results: { data },
          } = await this.hb.compute({ pid: di.target, slot })
          if (typeof data !== "undefined") _data = data
        }
      } catch (e) {
        console.log(e)
      }
      res.send({ slot, timestamp: 0 })
      if (this.bundler) await this.toArweave(di)
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
      await this.toAOS(di2)
    })
    app.listen(port, () => console.log(`Server is running on port ${port}`))
  }
  async toArweave(di) {
    const res = await fetch(this.bundler, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: di.binary,
    })
    console.log(res)
  }
  async toAOS(di) {
    await di.sign(this.signer)
    const _tags = tags(di.tags)
    console.log("toAOS", _tags)
    const res = await fetch(this.mu, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: di.binary,
    })
    console.log(res)
  }
  stop() {
    console.log(`SU is shutting down...`)
    this.app.close()
  }
}
