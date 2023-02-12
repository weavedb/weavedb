const { LoggerFactory, lastPossibleSortKey } = require("warp-contracts")
const { createClient } = require("redis")
const {
  map,
  o,
  last,
  pluck,
  split,
  compose,
  reverse,
  isNil,
  sortBy,
  identity,
  takeWhile,
  head,
} = require("ramda")

class RedisCache {
  constructor(cacheOptions) {
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
    return result
      ? {
          sortKey: cacheKey.sortKey,
          cachedValue: result,
        }
      : null
  }

  async getLast(key) {
    const keys = await this.client.KEYS(`${this.prefix}.*`)
    const start = `${key}|${lastPossibleSortKey}`
    const _key = compose(
      head,
      map(o(last, split("."))),
      reverse,
      takeWhile(v => v <= `${this.prefix}.${start}`),
      sortBy(identity)
    )(keys)
    return isNil(_key)
      ? null
      : !_key.startsWith(key)
      ? null
      : {
          sortKey: _key.split("|")[1],
          cachedValue: JSON.parse(
            await this.client.get(`${this.prefix}.${_key}`)
          ),
        }
  }

  async getLessOrEqual(key, sortKey) {
    const start = `${key}|${sortKey}`
    const keys = await this.client.KEYS(`${this.prefix}.*`)
    let _key = compose(
      head,
      map(o(last, split("."))),
      reverse,
      takeWhile(v => v <= `${this.prefix}.${start}`),
      sortBy(identity)
    )(keys)
    return isNil(_key)
      ? null
      : !_key.startsWith(key)
      ? null
      : {
          sortKey: _key.split("|")[1],
          cachedValue: JSON.parse(
            await this.client.get(`${this.prefix}.${_key}`)
          ),
        }
  }

  async put(cacheKey, value) {
    return await this.client.set(
      `${this.prefix}.${cacheKey.key}|${cacheKey.sortKey}`,
      JSON.stringify(value)
    )
  }
}

module.exports = { RedisCache }
