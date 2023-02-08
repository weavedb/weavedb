const { createClient } = require("redis")
const { isNil } = require("ramda")

/**
 * if (!isNil(config.redis) && !isNil(config.ratelimit) && !isNil(config.ratelimit.every)) {
 * const ratelimit = new RateLimitCount(config.ratelimit, config.redis)
 *  await ratelimit.init()
 *  if (checkCountLimit(contractTxId)) {
 *   return res(`ratelimit ${config.count}`)
 *  }
 * }
 */

class RateLimitCounter {
  constructor(rateLimitSetting, redisSetting) {
    try {
      this.every = rateLimitSetting.every
      this.limit = rateLimitSetting.limit
    } catch (e) {
      this.every = 5 // 5 min
      this.limit = 10 //
    }
    // console.log(`this.every: ${this.every}....rateLimitSetting: ${rateLimitSetting}`)
    this.prefix = "prefix."
    try {
      this.redisClient = createClient(redisSetting)
      return
    } catch (e) {
      console.log(e)
    }
  }

  async init() {
    if (!isNil(this.redisClient)) {
      try {
        await this.redisClient.connect()
        console.log("redis is ready!")
        this.redisEnabled = true
      } catch (e) {
        // console.log(e)
        console.log("redis error")
      }
    }
  }

  async checkCountLimit(contractTxId) {
    if (
      isNil(this.redisEnabled) ||
      !this.redisEnabled ||
      !this.redisClient ||
      !contractTxId ||
      contractTxId == ""
    )
      return false
    const cnt = await this.getCount(contractTxId)
    console.log(
      `contractTxId: ${contractTxId}, cnt:${cnt}, this.limit: ${this.limit}`
    )
    if (cnt > this.limit) {
      return true
    }
    try {
      await this.countUp(contractTxId)
    } catch (e) {
      console.log(e)
    }
    return false
  }

  _getKey(contractTxId, currentTime = 0) {
    if (
      isNil(this.redisEnabled) ||
      !this.redisEnabled ||
      !this.redisClient ||
      !contractTxId ||
      contractTxId == ""
    )
      return false
    if (currentTime <= 0) {
      currentTime = Date.now()
    }

    const d = new Date(currentTime)
    const theorder = Math.floor(d.getUTCMinutes() / this.every)
    const k = `${
      this.prefix
    }.${contractTxId}.${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}-${d.getUTCHours()}-${theorder} `
    return k
  }

  async countUp(contractTxId) {
    if (
      isNil(this.redisEnabled) ||
      !this.redisEnabled ||
      !this.redisClient ||
      contractTxId == ""
    )
      return false

    const k = this._getKey(contractTxId)
    // console.log("k=",k)
    if (k) {
      try {
        console.log("a")
        await this.redisClient.incr(k)
      } catch (e) {
        console.log(e)
        return "redis incr err"
      }
      return true
    }

    return false
  }

  async getCount(contractTxId, min = 5) {
    if (
      isNil(this.redisEnabled) ||
      !this.redisEnabled ||
      !this.redisClient ||
      contractTxId == ""
    ) {
      console.log(`contractTxId ERROR: ${contractTxId}`)
      return false
    }
    const loopcnt = Math.ceil(min / this.every)
    // console.log(`min: ${min}`)
    // console.log(`this.every: ${this.every}`)
    if (loopcnt <= 0 || !loopcnt || loopcnt == NaN) {
      loopcnt = 1
    }
    let total = 0
    let t = Date.now()
    // console.log(`loopcnt: ${loopcnt}`)
    for (let i = 0; i < loopcnt; i++) {
      const k = this._getKey(contractTxId, t)
      // console.log(`k: ${k}, contractTxId: ${contractTxId}`)
      if (k && typeof k == "string") {
        const _cnt = await this.redisClient.get(k)
        if (_cnt) {
          const cnt = parseInt(_cnt, 10)
          if (cnt && cnt >= 0) {
            total = total + cnt
          }
        } else {
          console.log(`k=${k}, _cnt={$_cnt}`)
        }
      } else {
      }
      t = t - this.every * 1000 * 60
    }
    return total
  }
}

module.exports = RateLimitCounter
