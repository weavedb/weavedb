import express from "express"
import { ArweaveSigner, TurboFactory } from "@ardrive/turbo-sdk"
import { createData } from "@dha-team/arbundles"
import cors from "cors"
import bodyParser from "body-parser"
import { httpsig_from, structured_to } from "hbsig"

const toMsg = req => {
  let msg = req.headers
  if (req.body) msg.body = req.body
  return msg
}

export const result = req => {
  const msg = toMsg(req)
  const http = httpsig_from(msg)
  return structured_to(http)
}

export const signer = msg => {
  return {
    signatureType: 1,
    signatureLength: 512,
    ownerLength: 512,
    publicKey: msg.owner,
  }
}

export const item = async ({ pid, msg, data }) => {
  const tags = []
  let type = null
  if (msg["original-tags"]) {
    for (const tagObj of Object.values(msg["original-tags"])) {
      tags.push({ name: tagObj.name, value: tagObj.value })
      if (tagObj.name === "Type") type = tagObj.value
    }
  }
  let opt = { tags }
  if (type !== "Process") opt.target = pid
  const _data = data || ""
  const di = await createData(_data, signer(msg), opt)
  await di.setSignature(msg.signature)
  return { type, di, tags, data: _data }
}

const _upload = (di, attempt = 0) =>
  new Promise(async res => {
    if (Math.random() > 0) {
      res({ err: true, res: { status: 501 }, attempts: attempt })
    } else {
      try {
        const _res = await fetch("https://up.arweave.net:443/tx", {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
          },
          body: di.binary,
        })
        res({ err: null, res: _res, attempts: attempt })
      } catch (e) {
        res({
          err: true,
          errStr: e?.toString() ?? "error",
          res: { status: 502 },
          attempts: attempt,
        })
      }
    }
  })
export const upload = async di => {
  let res = { err: true, res: { status: 501 } }
  let attempt = 0
  do {
    res = await _upload(di, ++attempt)
    if (!res.err && res.res?.status) break
  } while (res.err && attempt < 5)
  return res
}

export const stats = async () => {
  try {
    const json = await fetch("https://arweave.net/block/current").then(r =>
      r.json(),
    )
    const h = json.height
    const ts = json.timestamp
    return { h, ts, err: null }
  } catch (e) {
    console.log(e)
    return { err: e }
  }
}

export const assignment = async ({
  jwk,
  out,
  nonce,
  height,
  timestamp,
  msg,
}) => {
  const atags = {
    Process: out.process,
    Epoch: out.epoch,
    Nonce: Number(++nonce).toString(),
    "Hash-Chain": out["hash-chain"],
    "Block-Height": Number(out["block-height"] ?? height).toString(),
    Tmestamp: Number(out["block-timestamp"] ?? timestamp).toString(),
    "Data-Protocol": "ao",
    Slot: Number(out.slot).toString(),
    Variant: "ao.TN.1",
    Type: "Assignment",
    Message: msg,
  }
  const tags = []
  if (msg["original-tags"]) {
    for (const k in atags) {
      tags.push({ name: k, value: atags[k] })
    }
  }
  const signer2 = new ArweaveSigner(jwk)
  const di2 = await createData("", signer2, { tags })
  await di2.sign(signer2)
  return di2
}
