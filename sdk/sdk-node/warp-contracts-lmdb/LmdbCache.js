"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.LmdbCache = void 0
const warp_contracts_1 = require("warp-contracts")
const lmdb_1 = require("lmdb")
class LmdbCache {
  constructor(cacheOptions, lmdbOptions) {
    this.cacheOptions = cacheOptions
    this.lmdbOptions = lmdbOptions
    this.logger = warp_contracts_1.LoggerFactory.INST.create("LmdbCache")
    this.ongoingTransactionMark = "$$warp-internal-transaction$$"
    this.subLevelSeparator = "|"
    if (!cacheOptions.dbLocation) {
      throw new Error(
        "LmdbCache cache configuration error - no db location specified"
      )
    }
    if (!lmdbOptions) {
      this.lmdbOptions = {
        maxEntriesPerContract: 10,
        minEntriesPerContract: 10,
      }
    }
    this.logger.info(`Using location ${cacheOptions.dbLocation}`)
    this.db = (0, lmdb_1.open)({
      path: `${cacheOptions.dbLocation}`,
      noSync: cacheOptions.inMemory,
    })
  }
  /**
   * Batch operations are all executed in one transaction using childTransaction.
   * For each put there is an old entries removal run.
   */
  async batch(opStack) {
    await this.db.transactionSync(async () => {
      for (const op of opStack) {
        if (op.type === "put") {
          await this.doPut(op.key, new ClientValueWrapper(op.value))
          await this.removeOldestEntries(op.key)
        } else if (op.type === "del") {
          await this.doDelete(op.key)
        }
      }
    })
  }
  async get(cacheKey, returnDeepCopy) {
    const joinedKey = this.dbEntryKey(cacheKey)
    const result = this.db.get(joinedKey) || null
    return this.joinedKeyResultToSortKeyCache({ key: joinedKey, value: result })
  }
  async getLast(key) {
    const result = this.db.getRange({
      start: `${key}${this.subLevelSeparator}${warp_contracts_1.lastPossibleSortKey}`,
      reverse: true,
      limit: 1,
    }).asArray
    if (result.length && result[0].key.startsWith(key)) {
      return this.joinedKeyResultToSortKeyCache(result[0])
    }
    return null
  }
  async getLessOrEqual(key, sortKey) {
    const result = this.db.getRange({
      start: `${key}${this.subLevelSeparator}${sortKey}`,
      reverse: true,
      limit: 1,
    }).asArray
    if (result.length && result[0].key.startsWith(key)) {
      return this.joinedKeyResultToSortKeyCache(result[0])
    }
    return null
  }
  async joinedKeyResultToSortKeyCache(joinedKeyResult) {
    const wrappedValue = joinedKeyResult.value
    if (
      wrappedValue &&
      wrappedValue.tomb === undefined &&
      wrappedValue.value === undefined
    ) {
      return new warp_contracts_1.SortKeyCacheResult(
        joinedKeyResult.key.split(this.subLevelSeparator)[1],
        wrappedValue
      )
    }
    if (
      wrappedValue &&
      wrappedValue.tomb === false &&
      wrappedValue.value != null
    ) {
      return new warp_contracts_1.SortKeyCacheResult(
        joinedKeyResult.key.split(this.subLevelSeparator)[1],
        wrappedValue.value
      )
    }
    return null
  }
  async put(cacheKey, value) {
    return this.db.childTransaction(() => {
      this.doPut(cacheKey, new ClientValueWrapper(value))
      this.removeOldestEntries(cacheKey)
    })
  }
  async del(cacheKey) {
    await this.doPut(cacheKey, new ClientValueWrapper(null, true))
  }
  async doPut(cacheKey, value) {
    const putResult = await this.db.put(this.dbEntryKey(cacheKey), value)
    if (putResult) {
      const previousCalls = this.rollbackBatch
      const db = this.db
      this.rollbackBatch = () => {
        db.removeSync(this.dbEntryKey(cacheKey))
        previousCalls()
      }
    }
    return putResult
  }
  dbEntryKey(cacheKey) {
    return `${cacheKey.key}${this.subLevelSeparator}${cacheKey.sortKey}`
  }
  async removeOldestEntries(cacheKey) {
    // Get number of elements that is already in cache.
    // +1 to account for the element we just put and will be inserted with this transaction
    const numInCache =
      1 +
      this.db.getKeysCount({
        start: `${cacheKey.key}${this.subLevelSeparator}${warp_contracts_1.genesisSortKey}`,
        end: this.dbEntryKey(cacheKey),
      })
    // Make sure there isn't too many entries for one contract
    if (numInCache <= this.lmdbOptions.maxEntriesPerContract) {
      // We're below the limit, finish
      return
    }
    // Remove the oldest entries, so after the final put there's minEntriesPerContract present
    const numToRemove = numInCache - this.lmdbOptions.minEntriesPerContract
    // Remove entries one by one, it's in a transaction so changes will be applied all at once
    this.db
      .getKeys({
        start: `${cacheKey.key}${this.subLevelSeparator}${warp_contracts_1.genesisSortKey}`,
        limit: numToRemove,
      })
      .forEach(key => {
        this.db.remove(key)
      })
  }
  async delete(key) {
    return this.db.childTransaction(() => {
      this.doDelete(key)
    })
  }
  async doDelete(key) {
    return this.db
      .getKeys({
        start: `${key}${this.subLevelSeparator}${warp_contracts_1.genesisSortKey}`,
        end: `${key}${this.subLevelSeparator}${warp_contracts_1.lastPossibleSortKey}`,
      })
      .forEach(key => {
        this.db.remove(key)
      })
  }
  open() {
    if (this.db == null) {
      this.db = (0, lmdb_1.open)({
        path: `${this.cacheOptions.dbLocation}`,
        noSync: this.cacheOptions.inMemory,
      })
    }
    return
  }
  async close() {
    await this.db.close()
    this.db = null
    return
  }
  async dump() {
    throw new Error("Not implemented yet")
  }
  async getLastSortKey() {
    throw new Error("Not implemented yet")
  }
  async keys(sortKey, options) {
    return Array.from((await this.kvMap(sortKey, options)).keys())
  }
  storage() {
    return this.db
  }
  async prune(entriesStored = 1) {
    if (!entriesStored || entriesStored <= 0) {
      entriesStored = 1
    }
    const statsBefore = await this.db.childTransaction(() => {
      const statsBefore = this.db.getStats()
      // Keys are ordered, so one particular contract is referred to by consecutive keys (one or more)
      let entryContractId = ""
      let entriesCounter = 0
      this.db
        .getKeys({ end: null, reverse: true, snapshot: false })
        .filter(key => {
          const [contractId] = key.split(this.subLevelSeparator, 1)
          if (contractId !== entryContractId) {
            // New entry
            entryContractId = contractId
            entriesCounter = 0
          }
          // Subsequent entry
          entriesCounter += 1
          return entriesCounter > entriesStored
        })
        .forEach(key => {
          // Remove keys over the specified limit
          this.db.removeSync(key)
        })
      return statsBefore
    })
    // All previous writes have been committed and fully flushed/synced to disk/storage
    await this.db.flushed
    const statsAfter = this.db.getStats()
    return {
      entriesBefore: statsBefore.entryCount,
      sizeBefore: statsBefore.mapSize,
      entriesAfter: statsAfter.entryCount,
      sizeAfter: statsAfter.mapSize,
    }
  }
  async begin() {
    await this.checkPreviousTransactionFinished()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this.db.put(this.ongoingTransactionMark, "ongoing")
    const db = this.db
    this.rollbackBatch = () => {
      return db.removeSync(this.ongoingTransactionMark)
    }
    return
  }
  async checkPreviousTransactionFinished() {
    const transactionMarkValue = await this.db.get(this.ongoingTransactionMark)
    if (transactionMarkValue == "ongoing") {
      throw new Error(
        `Database seems to be in inconsistent state. The previous transaction has not finished.`
      )
    }
  }
  async commit() {
    this.db.removeSync(this.ongoingTransactionMark)
    this.rollbackBatch = () => {
      return
    }
  }
  async kvMap(sortKey, options) {
    const rangeOptions = {
      start: (options === null || options === void 0 ? void 0 : options.reverse)
        ? options === null || options === void 0
          ? void 0
          : options.lt
        : options === null || options === void 0
        ? void 0
        : options.gte,
      end: (options === null || options === void 0 ? void 0 : options.reverse)
        ? options === null || options === void 0
          ? void 0
          : options.gte
        : options === null || options === void 0
        ? void 0
        : options.lt,
      reverse:
        options === null || options === void 0 ? void 0 : options.reverse,
    }
    const result = new Map()
    const rangedKeys = this.db
      .getKeys(rangeOptions)
      .filter(k => k != this.ongoingTransactionMark)
    for (const joinedKey of rangedKeys) {
      const clientKey = joinedKey.split(this.subLevelSeparator)[0]
      const wrappedValue = await this.getLessOrEqual(clientKey, sortKey)
      if (wrappedValue) {
        result.set(
          clientKey,
          (await this.getLessOrEqual(clientKey, sortKey)).cachedValue
        )
      }
    }
    if (options === null || options === void 0 ? void 0 : options.limit) {
      const limitedResult = new Map()
      for (const item of Array.from(result.entries()).slice(0, options.limit)) {
        limitedResult.set(item[0], item[1])
      }
      return limitedResult
    }
    return result
  }
  async rollback() {
    this.rollbackBatch = () => {
      return
    }
    await this.db.transactionSync(this.rollbackBatch)
  }
}
exports.LmdbCache = LmdbCache
class ClientValueWrapper {
  constructor(value, tomb = false) {
    this.value = value
    this.tomb = tomb
  }
}
//# sourceMappingURL=LmdbCache.js.map
