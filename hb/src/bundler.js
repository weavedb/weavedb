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
let hb = null

import { open } from "lmdb"
import {
  stats,
  item,
  result,
  signer,
  upload,
  assignment,
} from "./bundler-utils.js"
import { range, pick, keys, without } from "ramda"

const delDone = k => {
  let d = dbs[k]
  if (d.min + 1 < d.current) {
    for (let i = d.min + 1; i < d.current; i++) {
      if (d.done[i]) {
        d.min = i
        delete d.done[i]
      } else break
    }
  }
}
const processMissing = async () => {
  for (let k in dbs) {
    for (let v of dbs[k].missing ?? []) {
      console.log("missing...............", v)
      try {
        const { out } = await hb.get({
          path: `/~weavedb@1.0/get_message?pid=${k}&slot=${v}`,
        })
        processOut({ out })
      } catch (e) {}
    }
  }
  setTimeout(async () => await processMissing(), 10000)
}
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
const getTimestamp = async () => {
  if (Date.now() - last_checked > timeout) {
    const { h, ts, err } = await stats()
    if (!err) {
      height = h
      timestamp = ts
      last_checked = Date.now()
    }
  }
}

const uploadMsg = async ({ type, di, id }) => {
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

const initMessage = async ({ id, msg, data, out }) => {
  {
    msgs[id] = { msg, data, out }
    await io.put(id, msgs[id])
    await io.put(["assign", out.process, out.slot], { mid: id })
    assigns[out.process] ??= {}
    assigns[out.process][out.slot] ??= { mid: id }
  }
}
const uploadAssign = async ({ id, out, di }) => {
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
const processMessage = async ({ out, msg, id, data: _data }) => {
  if (msg["commitment-device"] === "ans104@1.0") {
    let { type, di, tags, data } = await item({
      msg,
      pid: out.process,
      data: _data,
    })
    const valid = await di.isValid()
    console.log(`new message[${out.process}]:`, valid, id, out.slot)
    if (!valid) {
      console.log("invalid signature:", type, di, tags, typeof data)
      console.log(msg, data)
    } else {
      if (typeof msgs[id] === "undefined")
        await initMessage({ id, msg, data: _data, out })
      if (msgs[id].message !== true) await uploadMsg({ type, di, id })
      await io.put(id, msgs[id])
      if (type !== "Process" && msgs[id].message) {
        if (msgs[id].assign !== true) {
          if (!out["block-timestamp"]) await getTimestamp()
          await uploadAssign({ id, out, di })
        }
      }
      if (
        msgs[id] &&
        msgs[id].done !== true &&
        msgs[id].message &&
        (msgs[id].assign || type === "Process")
      ) {
        msgs[id].done = true
        delete undone[id]
        await io.put("undone", undone)
        dbs[out.process] ??= { min: -1, current: -1, missing: [], done: {} }
        if (dbs[out.process].current + 1 < +out.slot) {
          for (let i = dbs[out.process].current + 1; i < +out.slot; i++) {
            if (dbs[out.process].done[i] !== true)
              dbs[out.process].missing.push(i)
          }
        } else {
          dbs[out.process].missing = without(
            [+out.slot],
            dbs[out.process].missing,
          )
        }
        if (dbs[out.process].min < +out.slot) {
          dbs[out.process].done[out.slot] = true
        }
        if (+out.slot > dbs[out.process].current) {
          dbs[out.process].current = +out.slot
        }
        delDone(out.process)
        await io.put("dbs", dbs)
        console.log(out)
        console.log(+out.slot, dbs)
      }
      await io.put(id, msgs[id])
    }
  }
}

const processOut = async ({ out }) => {
  let id = null
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
  return id
}
const bundler = async ({
  port = 4001,
  jwk: _jwk,
  timeout: _timeout,
  dbpath,
  mock: _mock = false,
  hb: _hb,
} = {}) => {
  if (_timeout) timeout = _timeout
  hb = new HB({ url: _hb })
  jwk = _jwk
  mock = _mock
  io = open({ path: dbpath })
  undone = io.get("undone") ?? {}
  dbs = io.get("dbs") ?? {}
  unsolved = io.get("unsolved") ?? {}
  processUndone()
  processMissing()
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
      id = await processOut({ out })
    } catch (e) {
      console.log(e)
    }
    delete ongoing[id]
  })
  return app.listen(port, () => console.log(`Bundler on port ${port}`))
}

export default bundler
