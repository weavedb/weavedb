import express from "express"
import { ArweaveSigner, TurboFactory } from "@ardrive/turbo-sdk"
import cors from "cors"
import bodyParser from "body-parser"
import { HB } from "wao"
import { tags as _t } from "wao/utils"

let timeout = 1000 * 60
let timestamp = 0
let height = 0
let last_checked = 0
let nonce = 0
let mock = false
let msgs = {}
let assigns = {}
let ongoing = {}
let undone = {}
let unsolved = {}
let dbs = {}
let io = null
let jwk = null

import { open } from "lmdb"
import {
  stats,
  item,
  result,
  signer,
  upload,
  assignment,
} from "./bundler-utils.js"
import { range, pick, keys } from "ramda"

const processUndone = async () => {
  let arr = []
  for (const k in undone) {
    if (ongoing[k] !== true) arr.push(k)
  }
  if (arr.length > 0) {
    console.log("undone:", arr.length)
    console.log(ongoing)
    console.log(arr)
  }
  for (const k of arr) {
    const data = io.get(k)
    if (!data) {
      delete undone[k]
      await io.put("undone", undone)
      continue
    }
    const msg =
      data.upload_status && data.upload_status >= 300 && data.message !== true
    const assign =
      data.upload_assign_status &&
      data.upload_assign_status >= 300 &&
      data.assign !== true
    if (data.out && (msg || assign)) {
      console.log(
        "[Undone]",
        k,
        ", message:",
        data.message,
        ", assignment:",
        data.assign ?? false,
      )
      msgs[k] ??= data
      try {
        await processMessage({
          msg: data.msg,
          id: k,
          data: data.data,
          out: data.out,
        })
      } catch (e) {
        console.log(e)
      }
    } else {
      delete undone[k]
      unsolved[k] = true
      await io.put("undone", undone)
      await io.put("unsolved", unsolved)
    }
  }
  setTimeout(async () => await processUndone(), 10000)
}

const processMessage = async ({ out, msg, id, data: _data }) => {
  if (msg["commitment-device"] === "ans104@1.0") {
    let { type, di, tags, data } = await item({
      msg,
      pid: out.process,
      data: _data,
    })
    console.log(di.id, id)
    const valid = await di.isValid()
    console.log("new message:", valid, id)
    if (!valid) {
      console.log("invalid signature:", type, di, tags, typeof data)
      console.log(msg, data)
    } else {
      if (typeof msgs[id] === "undefined") {
        msgs[id] = { msg, data: _data, out }
        await io.put(id, msgs[id])
        await io.put(["assign", out.process, out.slot], { mid: id })
        assigns[out.process] ??= {}
        assigns[out.process][out.slot] ??= { mid: id }
        console.log(assigns)
      }
      if (msgs[id].message !== true) {
        try {
          const { res, err, errStr } = await upload(di, mock)
          if (!err && res?.status === 200) {
            console.log(
              `uploaded ${type} to Arweave (${di.binary.length / 1000} KB):`,
              di.id,
            )
            msgs[id].message = true
          } else {
            console.log(
              `uploaded ${type} failed  (${di.binary.length / 1000} KB):`,
              di.id,
            )
            console.log(res)
            msgs[id].message = false
            msgs[id].upload_status = res?.status
            msgs[id].upload_err = errStr
          }
        } catch (e) {
          // error 1
          msgs[id].message = false
          msgs[id].error_upload = e.toString() ?? "err"
        }
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
            nonce: +out.slot,
            height,
            timestamp,
            msg: di.id,
          })
          const id2 = di2.id
          try {
            const { err, res, errStr } = await upload(di2, mock)
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
              msgs[id].assign = false
              msgs[id].upload_assign_status = res?.status
              msgs[id].upload_assign_err = errStr
              console.log(res)
            }
          } catch (e) {
            // error2
            console.log(e)
            msgs[id].error2 = e.toString() ?? "err"
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
        await io.put("undone", undone)
      }
      await io.put(id, msgs[id])
    }
  }
}

const bundler = async ({
  port = 4001,
  jwk: _jwk,
  timeout: _timeout,
  dbpath,
  mock: _mock = false,
} = {}) => {
  if (_timeout) timeout = _timeout
  jwk = _jwk
  mock = _mock
  io = open({ path: dbpath })
  undone = io.get("undone") ?? {}
  dbs = io.get("dbs") ?? {}
  unsolved = io.get("unsolved") ?? {}
  processUndone()
  const app = express()
  app.use(cors())
  app.use(bodyParser.raw({ type: "*/*", limit: "100mb" }))
  app.post("/tx", async (req, res) => {
    if (!Buffer.isBuffer(req.body)) {
      console.log("BD: Invalid body | expected raw Buffer")
      return res.status(400).send("Invalid body: expected raw Buffer")
    }
    res.status(200).send("success")
    let id = null
    try {
      const out = result(req)
      for (const k in out.body?.commitments ?? {}) {
        id = k
        if (ongoing[id] !== true && msgs[id]?.done !== true) {
          ongoing[id] = true
          if (typeof undone[id] === "undefined") await io.put("undone", undone)
          let msg
          let _out
          try {
            if (msgs[id]?.message !== true) {
              msg = out.body?.commitments[k]
              const process = out.process
              const data = out.data ?? out.body?.data
              _out = pick(
                [
                  "hash-chain",
                  "process",
                  "block-height",
                  "block-timestamp",
                  "slot",
                ],
                out,
              )
              await processMessage({ msg, id, data, out: _out })
            }
          } catch (e) {
            console.log(e)
            console.log(id)
            console.log(out)
            console.log(msg)
          }
          delete ongoing[id]
        }
      }
    } catch (e) {
      console.log(e)
    }
    delete ongoing[id]
  })
  return app.listen(port, () => console.log(`Bundler on port ${port}`))
}

export default bundler
