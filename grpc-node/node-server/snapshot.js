const fs = require("fs")
const path = require("path")
const archiver = require("archiver")
const extract = require("extract-zip")
const cacheDirPath = path.resolve(__dirname, "cache/warp")
const { isNil, none, any, forEach } = require("ramda")

class Snapshot {
  constructor(config) {
    this.config = config
    try {
      if (!isNil(config.gcs)) {
        this.initGCS()
      } else if (none(isNil)([config.s3, config.s3.bucket, config.s3.prefix])) {
        this.initS3()
      }
    } catch (e) {
      console.log(e)
    }
  }

  initGCS() {
    const { Storage } = require("@google-cloud/storage")
    const storage = new Storage({
      keyFilename: path.resolve(__dirname, this.config.gcs.keyFilename),
    })
    this.gcsBucket = storage.bucket(this.config.gcs.bucket)
  }

  initS3() {
    const accessKeyId =
      this.config.s3.accessKeyId || process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey =
      this.config.s3.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
    const region = this.config.s3.region || process.env.AWS_REGION

    if (none(isNil)([accessKeyId, secretAccessKey, region])) {
      const { S3 } = require("aws-sdk")
      this.s3Ins = new S3({
        apiVersion: "2006-03-01",
        useDualstackEndpoint: true,
        accessKeyId,
        secretAccessKey,
        region,
      })
    } else {
      forEach(console.log)([
        "lacking s3 settings",
        `AWS_ACCESS_KEY_ID: ${accessKeyId}`,
        `AWS_SECRET_ACCESS_KEY: ${secretAccessKey}`,
        `AWS_REGION: ${region}`,
      ])
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
        const s3data = await this.s3Ins
          .getObject({
            Bucket: this.config.s3.bucket,
            Key: `${this.config.s3.prefix}${contractTxId}.zip`,
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
    await this.s3Ins
      .putObject({
        Bucket: this.config.s3.bucket,
        Key: `${this.config.s3.prefix}${contractTxId}.zip`,
        Body: fs.readFileSync(
          path.resolve(cacheDirPath, `${contractTxId}.zip`)
        ),
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
    archive.on("error", err => console.log(err))
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
