const fs = require("fs")
const path = require("path")
const archiver = require("archiver")
const extract = require("extract-zip")
const config = require("./weavedb.config.js")
const cacheDirPath = path.resolve(__dirname, "cache/warp")
const { isNil, none, any } = require("ramda")

class Snapshot {
  constructor(config) {
    if (!isNil(config.gcs)) {
      try {
        const { Storage } = require("@google-cloud/storage")
        const gcs = path.resolve(__dirname, config.gcs.keyFilename)
        const storage = new Storage({ keyFilename: gcs })
        this.gcsBucket = storage.bucket(config.gcs.bucket)
      } catch (e) {
        console.log(e)
      }
    } else if (none(isNil)([config.s3, config.s3.bucket, config.s3.prefix])) {
      try {
        const accessKeyId = !isNil(config.s3.accessKeyId)
          ? config.s3.accessKeyId
          : process.env.AWS_ACCESS_KEY_ID
        const secretAccessKey = !isNil(config.s3.secretAccessKey)
          ? config.s3.secretAccessKey
          : process.env.AWS_SECRET_ACCESS_KEY
        const s3region = !isNil(config.s3.region)
          ? config.s3.region
          : process.env.AWS_REGION

        if (none(isNil)([accessKeyId, secretAccessKey, s3region])) {
          const { S3 } = require("aws-sdk")
          this.s3Ins = new S3({
            apiVersion: "2006-03-01",
            useDualstackEndpoint: true,
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            region: s3region,
          })
        } else {
          console.log("lacking s3 settings")
          console.log(`AWS_ACCESS_KEY_ID: ${accessKeyId}`)
          console.log(`AWS_SECRET_ACCESS_KEY: ${secretAccessKey}`)
          console.log(`AWS_REGION: ${s3region}`)
        }
      } catch (e) {
        console.log(e)
      }
    }
  }

  async recover(contractTxId) {
    try {
      fs.mkdirSync(cacheDirPath, { recursive: true })
    } catch (e) {
      console.log(e)
    }
    const src = path.resolve(cacheDirPath, `${contractTxId}-downloaded.zip`)
    const dest = path.resolve(cacheDirPath, `${contractTxId}/`)
    try {
      if (!isNil(this.gcsBucket)) {
        await this.gcsBucket.file(`${contractTxId}.zip`).download({
          destination: src,
        })
        await extract(src, { dir: dest })
        console.log(`snapshot(${contractTxId}) downloaded!`)
      } else if (!isNil(this.s3Ins)) {
        const s3key = `${config.s3.prefix}${contractTxId}.zip`
        const s3data = await this.s3Ins
          .getObject({
            Bucket: config.s3.bucket,
            Key: s3key,
          })
          .promise()
        if (any(isNil)([s3data, s3data.Body])) {
          console.log(`snapshot(${contractTxId}) downloaded error! (s3)`)
        } else {
          fs.writeFileSync(src, s3data.Body)
          await extract(src, { dir: dest })
          console.log(`snapshot(${contractTxId}) downloaded! (s3)`)
        }
      }
    } catch (e) {
      console.log(e)
      console.log(`snapshot(${contractTxId}]) doesn't exist`)
    }
  }

  async save(contractTxId) {
    try {
      if (!isNil(this.gcsBucket)) {
        this.saveSnapShotGCS(contractTxId)
        console.log(`snapshot(${contractTxId}) saved!`)
      } else if (!isNil(this.s3Ins)) {
        this.saveSnapShotS3(contractTxId)
        console.log(`snapshot(${contractTxId}) saved! (s3)`)
      }
    } catch (e) {
      console.log(`snapshot(${contractTxId}) save error!`)
      console.log(e)
    }
  }

  async uploadToGCS(contractTxId) {
    const destination = `${contractTxId}.zip`
    await this.gcsBucket.upload(path.resolve(cacheDirPath, destination), {
      destination,
    })
  }

  async uploadToS3(contractTxId) {
    const data = fs.readFileSync(
      path.resolve(cacheDirPath, `${contractTxId}.zip`)
    )
    await this.s3Ins
      .putObject({
        Bucket: config.s3.bucket,
        Key: `${config.s3.prefix}${contractTxId}.zip`,
        Body: data,
      })
      .promise()
  }

  async saveSnapShotGCS(contractTxId) {
    this.archive(contractTxId, this.uploadToGCS.bind(this))
  }

  async saveSnapShotS3(contractTxId) {
    this.archive(contractTxId, this.uploadToS3.bind(this))
  }

  archive(contractTxId, uploader) {
    const output = fs.createWriteStream(
      path.resolve(cacheDirPath, `${contractTxId}.zip`)
    )
    const archive = archiver("zip", {
      zlib: { level: 9 },
    })
    archive.on("error", err => {
      console.log(err)
    })
    output.on("close", () => uploader(contractTxId))
    archive.pipe(output)
    archive.directory(
      path.resolve(cacheDirPath, `${contractTxId}/state/`),
      "state"
    )
    archive.directory(
      path.resolve(cacheDirPath, `${contractTxId}/contracts/`),
      "contracts"
    )
    archive.finalize()
  }
}
module.exports = Snapshot
