const SDK = require("weavedb-node-client")
const { Storage } = require("@google-cloud/storage")
const { isNil } = require("ramda")

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
  let image = null
  let cover = null
  let extra = {}
  const addr = req.body.query.query[2]
  const nonce = req.body.query.nonce
  const prefix = isNil(process.env.GCS_PREFIX)
    ? ""
    : `${process.env.GCS_PREFIX}/`
  if (!isNil(req.body.image)) {
    try {
      const buf = Buffer.from(req.body.image.split(",")[1], "base64")
      const ext = req.body.image.split(";")[0].split("/")[1]
      const filename = `${prefix}profile/${addr}/image-${nonce}.${ext}`
      await bucket.file(filename).save(buf)
      await bucket.file(filename).makePublic()
      image = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filename}`
      extra.image = image
    } catch (e) {
      console.log(e)
    }
  }
  if (!isNil(req.body.cover)) {
    try {
      const buf = Buffer.from(req.body.cover.split(",")[1], "base64")
      const ext = req.body.cover.split(";")[0].split("/")[1]
      const filename = `${prefix}profile/${addr}/cover-${nonce}.${ext}`
      await bucket.file(filename).save(buf)
      await bucket.file(filename).makePublic()
      cover = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filename}`
      extra.cover = cover
    } catch (e) {
      console.log(e)
    }
  }
  try {
    tx = await db.relay("profile", req.body.query, extra, {
      privateKey: process.env.RELAYER_PRIVATE_KEY,
    })
  } catch (e) {
    console.log(e)
  }
  res.status(200).json({ tx, cover, image })
}
