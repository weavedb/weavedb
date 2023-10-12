const SDK = require("weavedb-node-client")
const { Storage } = require("@google-cloud/storage")
const { isNil } = require("ramda")
const { nanoid } = require("nanoid")
export default async (req, res) => {
  const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
      client_email: process.env.GCS_EMAIL,
      private_key: process.env.GCS_PRIVATE_KEY,
    },
  })
  const contractTxId = process.env.NEXT_PUBLIC_TXID ?? "offchain"
  const bucket = storage.bucket(process.env.GCS_BUCKET)
  const db = new SDK({ rpc: process.env.RPC, contractTxId })
  let tx = null
  let body = null
  let cover = null
  let extra = {}
  const addr = req.body.query.query[0].owner
  const id = nanoid()
  const nonce = req.body.query.nonce
  const prefix = isNil(process.env.GCS_PREFIX)
    ? ""
    : `${process.env.GCS_PREFIX}/`
  if (!isNil(req.body.body)) {
    try {
      const buf = req.body.body
      const ext = "json"
      const filename = `${prefix}articles/body-${id}-${nonce}.${ext}`
      await bucket.file(filename).save(buf)
      await bucket.file(filename).makePublic()
      body = `https://${process.env.GCS_BUCKET}.storage.googleapis.com/${filename}`
      extra.body = body
    } catch (e) {
      console.log(e)
    }
  }
  if (!isNil(req.body.cover)) {
    try {
      const buf = Buffer.from(req.body.cover.split(",")[1], "base64")
      const ext = req.body.cover.split(";")[0].split("/")[1]
      const filename = `${prefix}article/cover-${id}-${nonce}.${ext}`
      await bucket.file(filename).save(buf)
      await bucket.file(filename).makePublic()
      cover = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filename}`
      extra.cover = cover
    } catch (e) {
      console.log(e)
    }
  }
  try {
    tx = await db.relay("article", req.body.query, extra, {
      privateKey: process.env.RELAYER_PRIVATE_KEY,
    })
  } catch (e) {
    console.log(e)
  }
  res.status(200).json({ tx, cover, body })
}
