import express from "express"
import { ArweaveSigner, TurboFactory } from "@ardrive/turbo-sdk"
import cors from "cors"
import bodyParser from "body-parser"
import { HB } from "wao"
import { tags as _t } from "wao/utils"

let timestamp = 0
let height = 0
let last_checked = 0
let nonce = 0

let msgs = {}
let ongoing = {}
let undone = {}
import { open } from "lmdb"
import {
  stats,
  item,
  result,
  signer,
  upload,
  assignment,
} from "./bundler-utils.js"
import { range } from "ramda"
const processUndone = async (undone, io) => {
  for (const k in undone) {
    const data = io.get(k)
    if (!data) {
      delete undone[k]
      continue
    }
    const { type, di } = await item({ msg: data.msg })
  }
  await io.put("undone", undone)
}

// track undone
// track slots and get missing msgs from HyperBEAM

const e = [
  { name: "signingFormat", value: "ANS-104" },
  { name: "Type", value: "Message" },
  {
    name: "zkhash",
    value: "B60m6myA5cGvy2lzTea4KyKiw75f/xe6bU9NTZNX9rI=",
  },
  { name: "Action", value: "Commit" },
  { name: "Data-Protocol", value: "ao" },
  { name: "Variant", value: "ao.TN.1" },
]

const bundler2 = async ({
  port = 4001,
  jwk,
  timeout = 1000 * 60,
  dbpath,
} = {}) => {
  const hb = new HB({})
  for (const i of range(0, 1000)) {
    const { out } = await hb.get({
      path:
        "/~weavedb@1.0/get_message?pid=BHlZigPa4K-dsLXxeZsP_jtLtXRx6O5Aoti_FKOCJOM&slot=" +
        i,
    })
    for (const k in out.body?.commitments ?? {}) {
      const msg = out.body?.commitments[k]
      if (msg["commitment-device"] === "ans104@1.0") {
        const _data = out.data ?? out.body?.data
        let { type, di, tags, data } = await item({
          msg,
          pid: out.process,
          data: _data,
        })
        const valid = await di.isValid()
        if (!valid) {
          console.log(i)
          console.log(msg, out.process, _data)
        } else {
          console.log(valid, di.id)
        }
      }
    }
  }
}

const bundler = async ({
  port = 4001,
  jwk,
  timeout = 1000 * 60,
  dbpath,
} = {}) => {
  const io = open({ path: dbpath })
  undone = io.get("undone") ?? {}
  console.log("undone", undone)
  //processUndone(undone, io)
  const app = express()
  app.use(cors())
  app.use(bodyParser.raw({ type: "*/*", limit: "100mb" }))
  app.post("/tx", async (req, res) => {
    if (!Buffer.isBuffer(req.body)) {
      console.log("BD: Invalid body | expected raw Buffer")
      return res.status(400).send("Invalid body: expected raw Buffer")
    }
    res.status(200).send("success")
    try {
      const out = result(req)
      let id = null
      for (const k in out.body?.commitments ?? {}) {
        id = k
        if (ongoing[id] !== true && msgs[id]?.done !== true) {
          if (typeof undone[id] === "undefined") {
            undone[id] = true
            await io.put("undone", undone)
          }
          let _msg = null
          try {
            if (msgs[id]?.message !== true) {
              const msg = out.body?.commitments[k]
              _msg = { msg, data: out.data ?? out.body?.data }
              if (msg["commitment-device"] === "ans104@1.0") {
                let { type, di, tags, data } = await item({
                  msg,
                  pid: out.process,
                  data: out.data ?? out.body?.data,
                })
                const valid = await di.isValid()
                console.log("new message:", valid, id)
                if (!valid) {
                  console.log("invalid signature:", type, di, tags, typeof data)
                  console.log(msg, data)
                } else {
                  ongoing[id] = true
                  if (typeof msgs[id] === "undefined") {
                    msgs[id] = { msg, pid: out.process, data: out.data }
                    await io.put(id, msgs[id])
                  }
                  try {
                    const { res, err } = await upload(di)
                    console.log(res)
                    if (!err && res?.status === 200) {
                      console.log(
                        `uploaded ${type} to Arweave (${di.binary.length / 1000} KB):`,
                        di.id,
                      )
                      msgs[id].message = true
                    } else {
                      console.log(
                        `uploaded Assignment failed  (${di.binary.length / 1000} KB):`,
                        di.id,
                      )
                      console.log(res)
                      msgs[id].message = false
                    }
                  } catch (e) {
                    msgs[id].message = false
                  }
                  await io.put(id, msgs[id])
                  if (type !== "Message") {
                    msgs[id].done = true
                    delete undone[id]
                    await io.put(id, msgs[id])
                    await io.put("undone", undone)
                  } else if (msgs[id].message) {
                    if (msgs[id].assign !== true) {
                      if (!out["block-timestamp"]) {
                        if (Date.now() - last_checked > timeout) {
                          const { h, ts, err } = await stats()
                          if (!err) {
                            height = h
                            timestamp = ts
                            last_checked = Date.now()
                          }
                        }
                      }
                      // todo: nonce management
                      const di2 = await assignment({
                        jwk,
                        out,
                        nonce: ++nonce,
                        height,
                        timestamp,
                        msg: di.id,
                      })
                      const id2 = di2.id
                      try {
                        const { err, res } = await upload(di2)
                        if (!err && res?.status === 200) {
                          console.log(
                            `uploaded Assignment to Arweave (${di2.binary.length / 1000} KB):`,
                            id2,
                          )
                          msgs[id].assign = true
                          await io.put(id, msgs[id])
                        } else {
                          console.log(
                            `uploaded Assignment failed  (${di2.binary.length / 1000} KB):`,
                            id2,
                          )
                          console.log(res)
                        }
                      } catch (e) {
                        console.log(e)
                      }
                    }
                  }
                  if (
                    msgs[id] &&
                    msgs[id].done !== true &&
                    msgs[id].message &&
                    msgs[id].assign
                  ) {
                    msgs[id].done = true
                    delete undone[id]
                    await io.put(id, msgs[id])
                    await io.put("undone", undone)
                  }
                }
              }
            }
          } catch (e) {
            console.log(_msg)
            console.log(e)
            process.exit()
          }
          delete ongoing[id]
        }
      }
    } catch (e) {
      console.log(e)
    }
  })
  return app.listen(port, () => console.log(`Bundler on port ${port}`))
}

export default bundler
