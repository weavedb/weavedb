const fs = require("fs")
const path = require("path")
const archiver = require("archiver")
const extract = require("extract-zip")
const cacheDirPath = path.resolve(__dirname, "../cache/warp")
const {
  partition,
  filter,
  last,
  map,
  tail,
  reject,
  mapObjIndexed,
  hasPath,
  isNil,
  none,
  any,
  forEach,
  zipObj,
  compose,
  flatten,
  values,
} = require("ramda")

class Snapshot {
  constructor(conf) {
    this.conf = conf
    try {
      if (!isNil(conf.gcs)) {
        this.initGCS()
      } else if (
        !isNil(conf.s3) &&
        !isNil(conf.s3.bucket) &&
        !isNil(conf.s3.prefix)
      ) {
        this.initS3()
      }
    } catch (e) {
      console.log(e)
    }
  }

  initGCS() {
    const { Storage } = require("@google-cloud/storage")
    const storage = new Storage({
      keyFilename: path.resolve(__dirname, "..", this.conf.gcs.keyFilename),
    })
    this.gcsBucket = storage.bucket(this.conf.gcs.bucket)
  }

  initS3() {
    const accessKeyId =
      this.conf.s3.accessKeyId || process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey =
      this.conf.s3.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
    const region = this.conf.s3.region || process.env.AWS_REGION

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
  async delete(contractTxId) {
    try {
      const zip = path.resolve(cacheDirPath, `${contractTxId}.zip`)
      const src = path.resolve(cacheDirPath, `${contractTxId}-downloaded.zip`)
      const dest = path.resolve(cacheDirPath, `${contractTxId}/`)
      for (const v of [zip, src, dest]) {
        try {
          fs.rmSync(v, { recursive: true, force: true })
        } catch (e) {
          console.log(e)
        }
      }
      console.log(`snapshot(${contractTxId}) deleted!`)
    } catch (e) {
      console.log(`snapshot(${contractTxId}]) deletion error`)
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
            Bucket: this.conf.s3.bucket,
            Key: `${this.conf.s3.prefix}${contractTxId}.zip`,
          })
          .promise()
        if (isNil(s3data) || isNil(s3data.Body)) {
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
  async recoverRedis(contractTxId, client) {
    try {
      fs.mkdirSync(cacheDirPath, { recursive: true })
    } catch (e) {
      console.log(e)
    }
    try {
      const redis = this.getRedis(client)
      const keys = await redis.client.KEYS(
        `${redis.prefix}.${contractTxId}.*.keys`
      )
      if (keys.length > 0) {
        console.log(`redis data(${contractTxId}) exists`)
        return
      }
      const src = path.resolve(
        cacheDirPath,
        `${contractTxId}-redis-${redis.prefix}.json`
      )
      const destination = `${contractTxId}-redis.json`
      try {
        if (!isNil(this.gcsBucket)) {
          await this.gcsBucket.file(destination).download({
            destination: src,
          })
        } else if (!isNil(this.s3Ins)) {
          const s3data = await this.s3Ins
            .getObject({
              Bucket: this.conf.s3.bucket,
              Key: `${this.conf.s3.prefix}${contractTxId}-redis.json`,
            })
            .promise()
          if (isNil(s3data) || isNil(s3data.Body)) {
            console.log(`snapshot(${contractTxId}) downloaded error! (s3)`)
          } else {
            fs.writeFileSync(src, s3data.Body)
          }
        }
        const json = JSON.parse(fs.readFileSync(src, "utf8"))
        for (const v of json.keys) {
          await redis.client.ZADD(
            `${redis.prefix}.${v.key}`,
            map(v2 => ({ score: 0, value: v2 }), v.sets)
          )
        }
        const vals = compose(
          flatten,
          reject(v => isNil(v[1])),
          values,
          mapObjIndexed((v, k) => [`${redis.prefix}.${k}`, v])
        )(json.vals)
        await redis.client.MSET(vals)
        console.log(`snapshot(${contractTxId}) recovered to redis!`)
      } catch (e) {
        console.log(e)
        console.log(`snapshot(${contractTxId}]) doesn't exist`)
      }
    } catch (e) {
      console.log(e)
    }
  }

  getRedis(redis) {
    if (!isNil(redis)) {
      return { client: redis, prefix: this.conf?.redis?.prefix || "warp" }
    }
    return null
  }

  async save(contractTxId, redis) {
    try {
      if (!isNil(this.gcsBucket)) {
        this.saveSnapShotGCS(contractTxId, this.getRedis(redis))
        console.log(`snapshot(${contractTxId}) saved!`)
      } else if (!isNil(this.s3Ins)) {
        this.saveSnapShotS3(contractTxId, this.getRedis(redis))
        console.log(`snapshot(${contractTxId}) saved! (s3)`)
      }
    } catch (e) {
      console.log(`snapshot(${contractTxId}) save error!`)
      console.log(e)
    }
  }

  async uploadToGCSRedis(contractTxId, redis) {
    const destination = `${contractTxId}-redis.json`
    const json_path = path.resolve(cacheDirPath, destination)
    await this.gcsBucket.upload(json_path, { destination })
  }

  async uploadToGCS(contractTxId) {
    const destination = `${contractTxId}.zip`
    await this.gcsBucket.upload(path.resolve(cacheDirPath, destination), {
      destination,
    })
  }

  async uploadToS3Redis(contractTxId, redis) {
    await this.s3Ins
      .putObject({
        Bucket: this.conf.s3.bucket,
        Key: `${this.conf.s3.prefix}${contractTxId}-redis.json`,
        Body: fs.readFileSync(
          path.resolve(cacheDirPath, `${contractTxId}-redis.json`)
        ),
      })
      .promise()
  }

  async uploadToS3(contractTxId) {
    await this.s3Ins
      .putObject({
        Bucket: this.conf.s3.bucket,
        Key: `${this.conf.s3.prefix}${contractTxId}.zip`,
        Body: fs.readFileSync(
          path.resolve(cacheDirPath, `${contractTxId}.zip`)
        ),
      })
      .promise()
  }

  async archiveRedis(contractTxId, uploader, redis) {
    try {
      fs.mkdirSync(cacheDirPath, { recursive: true })
    } catch (e) {
      console.log(e)
    }
    const json_path = path.resolve(cacheDirPath, `${contractTxId}-redis.json`)
    try {
      const _keys = await redis.client.KEYS(`${redis.prefix}.${contractTxId}.*`)
      const sets = partition(v => last(v.split(".")) === "keys")(_keys)
      if (sets[0].length > 0 && sets[1].length > 0) {
        const vals = zipObj(
          map(v => tail(v.split(".")).join("."))(sets[1]),
          await redis.client.MGET(sets[1])
        )
        let keys = []
        for (const k of sets[0]) {
          keys.push({
            key: tail(k.split(".")).join("."),
            sets: await redis.client.ZRANGE(k, `-`, `+`, { BY: "LEX" }),
          })
        }
        fs.writeFileSync(json_path, JSON.stringify({ vals, keys }))
        uploader(contractTxId, redis)
      }
    } catch (e) {
      console.log(e)
    }
  }

  async saveSnapShotGCS(contractTxId, redis) {
    if (!isNil(redis)) {
      await this.archiveRedis(
        contractTxId,
        this.uploadToGCSRedis.bind(this),
        redis
      )
    } else {
      this.archive(contractTxId, this.uploadToGCS.bind(this))
    }
  }

  async saveSnapShotS3(contractTxId, redis) {
    if (!isNil(redis)) {
      await this.archiveRedis(
        contractTxId,
        this.uploadToS3Redis.bind(this),
        redis
      )
    } else {
      this.archive(contractTxId, this.uploadToS3.bind(this))
    }
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
    archive.directory(path.resolve(cacheDirPath, `${contractTxId}/src/`), "src")

    archive.finalize()
  }
}

module.exports = Snapshot
