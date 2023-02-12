const { isNil } = require("ramda")

class Cache {
  constructor(conf, redis) {
    this.cache = {}
    if (!isNil(conf.redis)) this.redis = redis
  }

  async init() {
    if (!isNil(this.redis)) {
      try {
        await this.redis.connect()
        console.log("redis is ready!")
        this.isRedis = true
      } catch (e) {
        console.log(e)
        console.log("redis error")
      }
    }
  }

  async get(key) {
    if (this.isRedis) {
      try {
        return JSON.parse(await this.redis.get(key))
      } catch (e) {
        console.log(e)
      }
      return null
    } else {
      return this.cache[key]
    }
  }

  async set(key, val) {
    if (this.isRedis) {
      try {
        await this.redis.set(key, JSON.stringify(val))
      } catch (e) {
        console.log(e)
      }
    } else {
      this.cache[key] = val
    }
  }

  async exists(key) {
    if (this.isRedis) {
      try {
        return (await this.redis.exists(key)) === 1
      } catch (e) {}
      return false
    } else {
      return !isNil(this.cache[key])
    }
  }
}

module.exports = Cache
