const {
  genesisSortKey,
  LoggerFactory,
  lastPossibleSortKey,
} = require("warp-contracts")
const { map } = require("ramda")
class RedisCache {
  constructor(cacheOptions, lmdbOptions) {
    this.prefix = `${cacheOptions.prefix}`
    this.logger = LoggerFactory.INST.create("RedisCache")
    this.client = cacheOptions.client
  }

  async get(cacheKey, returnDeepCopy) {
    let result = null
    const res = await this.client.get(
      `${this.prefix}.${cacheKey.key}|${cacheKey.sortKey}`
    )
    if (res !== null) result = JSON.parse(res)
    if (result) {
      return {
        sortKey: cacheKey.sortKey,
        cachedValue: result,
      }
    } else {
      return null
    }
  }

  async getLast(key) {
    return this.getLessOrEqual(key, lastPossibleSortKey)
  }

  async getLessOrEqual(key, sortKey) {
    const result = await this.client.ZRANGE(
      `${this.prefix}.keys`,
      `[${key}|${sortKey}`,
      "-",
      {
        REV: true,
        BY: "LEX",
        limit: { count: 1, offset: 0 },
      }
    )
    if (result.length) {
      if (!result[0].startsWith(key)) {
        return null
      }
      return {
        sortKey: result[0].split("|")[1],
        cachedValue: JSON.parse(
          await this.client.get(`${this.prefix}.${result[0]}`)
        ),
      }
    } else {
      return null
    }
  }

  async put(cacheKey, value) {
    await this.client.set(
      `${this.prefix}.${cacheKey.key}|${cacheKey.sortKey}`,
      JSON.stringify(value)
    )
    await this.client.ZADD(`${this.prefix}.keys`, [
      { score: 0, value: `${cacheKey.key}|${cacheKey.sortKey}` },
    ])
    return
  }

  async batch(opStack) {
    for (const op of opStack) {
      if (op.type === "put") {
        await this.put(op.key, op.value)
      } else if (op.type === "del") {
        await this.delete(op.key)
      }
    }
  }

  async delete(key) {
    const keys = await this.client.ZRANGE(
      `${this.prefix}.keys`,
      `[${key}|${genesisSortKey}`,
      `[${key}|${lastPossibleSortKey}`,
      { BY: "LEX" }
    )
    await this.client.ZREM(`${this.prefix}.keys`, keys)
    return await this.client.del(map(k => `${this.prefix}.${k}`)(keys))
  }

  async dump() {
    console.log("dumping")
    throw new Error("Not implemented yet")
  }

  async getLastSortKey() {
    console.log("getLastSortKey")
    throw new Error("Not implemented yet")
  }

  async keys() {
    return map(v => v.split("|")[1])(
      await this.client.ZRANGE(`${this.prefix}.keys`, `-`, "+", {
        BY: "LEX",
      })
    )
  }

  storage() {
    console.log("storage")
    return this.client
  }

  async prune(entriesStored = 1) {
    console.log("prune", entriesStored)
    return
  }
}

module.exports = { RedisCache }
