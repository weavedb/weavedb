import express from "express"
import { ArweaveSigner, TurboFactory } from "@ardrive/turbo-sdk"
import { createData } from "@dha-team/arbundles"
import cors from "cors"
import bodyParser from "body-parser"
import { httpsig_from, structured_to } from "hbsig"
import { keys, omit } from "ramda"

let timestamp = 0
let height = 0
let last_checked = 0
let nonce = 0

const toMsg = req => {
  let msg = req.headers
  if (req.body) msg.body = req.body.toString("binary")
  return msg
}

const bundler = ({ port = 4001, jwk, timeout = 1000 * 60 } = {}) => {
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
      const out = structured_to(httpsig_from(toMsg(req)))
      for (const k in out.body?.commitments ?? {}) {
        const msg = out.body?.commitments[k]
        if (msg["commitment-device"] === "ans104@1.0") {
          const signer = {
            signatureType: 1,
            signatureLength: 512,
            ownerLength: 512,
            publicKey: msg.owner,
            sign: async () => {},
          }
          const tags = []
          let type = null
          if (msg["original-tags"]) {
            for (const tagObj of Object.values(msg["original-tags"])) {
              tags.push({ name: tagObj.name, value: tagObj.value })
              if (tagObj.name === "Type") {
                type = tagObj.value
              }
            }
          }
          let opt = { tags }
          if (type !== "Process") opt.target = out.process
          const di = await createData(out.data || "", signer, opt)
          await di.setSignature(msg.signature)
          const res = await fetch("https://up.arweave.net:443/tx", {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
            },
            body: di.binary,
          })
          console.log(res?.status, di.tags)
          const dis = [di]
          if (type === "Message") {
            if (!out["block-timestamp"]) {
              try {
                if (Date.now() - last_checked > timeout) {
                  const json = await fetch(
                    "https://arweave.net/block/current",
                  ).then(r => r.json())
                  height = json.height
                  timestamp = json.timestamp
                  last_checked = Date.now()
                }
              } catch (e) {
                console.log(e)
              }
            }
            const atags = {
              Process: out.process,
              Epoch: out.epoch,
              Nonce: Number(++nonce).toString(),
              "Hash-Chain": out["hash-chain"],
              "Block-Height": Number(out["block-height"] ?? height).toString(),
              Tmestamp: Number(out["block-timestamp"] ?? timestamp).toString(),
              "Data-Protocol": "ao",
              Slot: Number(out.slot).toString(),
              Variant: "ao.WDB.1",
              Type: "Assignment",
              Message: di.id,
            }
            const tags = []
            if (msg["original-tags"]) {
              for (const k in atags) tags.push({ name: k, value: atags[k] })
            }
            const signer = new ArweaveSigner(jwk)
            const di2 = await createData("", signer, { tags })
            await di2.sign(signer)
            dis.push(di2)
            const res2 = await fetch("https://up.arweave.net:443/tx", {
              method: "POST",
              headers: {
                "Content-Type": "application/octet-stream",
              },
              body: di2.binary,
            })
            console.log(res2?.status, di2.tags)
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
  })
  return app.listen(port, () => console.log(`BD on port ${port}`))
}

export default bundler
