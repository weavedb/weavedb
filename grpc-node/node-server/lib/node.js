const {
  o,
  map,
  includes,
  pluck,
  isNil,
  clone,
  of,
  is,
  unless,
  hasPath,
} = require("ramda")
const Arweave = require("arweave")
const Cache = require("./cache")
const Snapshot = require("./snapshot")
const SDK = require("weavedb-sdk-node")

const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")

const PROTO_PATH = __dirname + "/../weavedb.proto"
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const weavedb = grpc.loadPackageDefinition(packageDefinition).weavedb
const { execAdmin } = require("./admin")

class Node {
  constructor({ conf, port }) {
    this.conf = conf
    this.port = port
    this.sdks = {}
    this._init = {}
    this.lastChecked = {}

    this.initRedis()
    this.cache = new Cache(conf, this.redis)
    this.snapshot = new Snapshot(conf)
    this.isLmdb = (conf.cache || "lmdb") === "lmdb"
  }
  initRedis() {
    if (this.conf.cache === "redis") {
      const { createClient } = require("redis")
      this.redis = createClient({
        url: this.conf.redis?.url || null,
      })
      this.redis.connect()
    }
  }

  async initSDK(v, no_snapshot = false) {
    console.log("initializing contract..." + v)
    let success = true
    try {
      let _conf = clone(this.conf)
      let [txid, old] = v.split("@")
      _conf.contractTxId = txid
      if (old === "old") _conf.old = true
      if (this.isLmdb) {
        _conf.lmdb = {
          state: { dbLocation: `./cache/warp/${_conf.contractTxId}/state` },
          contracts: {
            dbLocation: `./cache/warp/${_conf.contractTxId}/contracts`,
          },
          src: {
            dbLocation: `./cache/warp/${_conf.contractTxId}/src`,
          },
        }
        if (!no_snapshot) await this.snapshot.recover(txid)
      }
      let __conf = clone(_conf)
      if (__conf.cache === "redis") {
        __conf.redis ||= {}
        __conf.redis.client = this.redis
      }
      this.sdks[txid] = new SDK(__conf)
      if (isNil(_conf.wallet)) await this.sdks[txid].initializeWithoutWallet()
      await this.sdks[txid].db.readState()
      if (this.isLmdb && !no_snapshot) await this.snapshot.save(txid)
      console.log(`sdk(${v}) ready!`)

      if (!isNil(this.conf.admin)) {
        if (
          !no_snapshot &&
          !isNil(this.conf.admin.contractTxId) &&
          this.conf.admin.contractTxId === v
        ) {
          try {
            const contracts = await this.sdks[txid].get("contracts")
            this.admin_sdk = this.sdks[txid]
            for (const v2 of pluck("txid", contracts)) {
              if (v2 !== this.conf.admin.contractTxId) this.initSDK(v2)
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.log(`sdk(${v}) error!`)
      success = false
    }
    return success
  }

  async rateLimit(txid) {
    if (
      !isNil(this.conf.redis) &&
      !isNil(this.conf.ratelimit) &&
      !isNil(this.conf.ratelimit.every)
    ) {
      const RateLimitCounter = require("./rate_limit_counter.js")
      const ratelimit = new RateLimitCounter(
        this.conf.ratelimit,
        this.conf.redis
      )
      await ratelimit.init()
      try {
        if (await ratelimit.checkCountLimit(txid)) return true
      } catch (e) {
        console.log(e.message)
      }
    }
    return false
  }

  async isAllowed(txid) {
    const allowed_contracts = o(
      map(v => v.split("@")[0]),
      unless(is(Array), of)
    )(this.conf.contractTxId || [])

    let allowed =
      !isNil(this.sdks[txid]) ||
      this.conf.allowAnyContracts === true ||
      includes(txid)(allowed_contracts) ||
      (!isNil(this.conf.admin) && this.conf.admin.contractTxId === txid)

    if (!allowed && !isNil(this.admin_sdk)) {
      try {
        const date = Date.now()
        if (
          isNil(this.lastChecked[txid]) ||
          this.lastChecked[txid] < date - 1000 * 60 * 10
        ) {
          this.lastChecked[txid] = date
          if (!isNil(await this.admin_sdk.get("contracts", txid))) {
            allowed = true
          }
        }
      } catch (e) {
        console.log(e)
      }
    }
    return allowed
  }

  parseQuery(call, callback) {
    const res = (err, result = null) => {
      callback(null, {
        result: isNil(result) ? null : JSON.stringify(result),
        err,
      })
    }
    const { method, query, nocache } = call.request
    let [func, txid] = method.split("@")
    if (!isNil(txid)) txid = txid.split("@")[0]
    return { nocache, res, txid, func, query, isAdmin: func === "admin" }
  }

  async sendQuery({ func, txid, nocache, query }, key) {
    let result = null
    let err = null
    const nameMap = { get: "getCache", cget: "cgetCache" }
    try {
      if (includes(func)(["get", "cget", "getNonce"])) {
        if (
          includes(func)(["get", "cget"]) &&
          (isNil(this._init[txid]) || nocache)
        ) {
          result = await this.sdks[txid][func](...JSON.parse(query))
          this._init[txid] = true
        } else {
          result = await this.sdks[txid][nameMap[func] || func](
            ...JSON.parse(query)
          )
        }
      } else if (includes(func)(this.sdks[txid].reads)) {
        result = await this.sdks[txid][func](...JSON.parse(query))
        await this.cache.set(key, { date: Date.now(), result })
      } else {
        result = await this.sdks[txid].write(
          func,
          JSON.parse(query),
          true,
          true
        )
      }
    } catch (e) {
      err = e.message
    }
    return { result, err }
  }

  async execUser(parsed) {
    const { res, nocache, txid, func, query } = parsed
    const _query = JSON.parse(query)
    const key = SDK.getKey(
      txid,
      func,
      _query.query || _query,
      hasPath(["redis", "prefix"], this.conf) ? this.conf.redis.prefix : null
    )
    let result, err
    if (
      includes(func)(this.sdks[txid].reads) &&
      (await this.cache.exists(key)) &&
      !nocache
    ) {
      result = (await this.cache.get(key)).result
      res(err, result)
      await this.sendQuery(parsed, key)
    } else {
      ;({ result, err } = await this.sendQuery(parsed, key))
      res(err, result)
    }
  }

  async query(call, callback) {
    let parsed = this.parseQuery(call, callback)
    const { res, nocache, txid, func, query, isAdmin } = parsed
    if (isNil(txid) && !isAdmin) return res("no contractTxId")
    if (await this.rateLimit(txid)) return res("rate limit error")
    if (isAdmin) return await execAdmin({ query, res, node: this, txid })
    if (!(await this.isAllowed(txid))) return res(`${txid} not allowed`)
    if (isNil(this.sdks[txid]) && !(await this.initSDK(txid))) {
      return res(`contract[${txid}] init failed`)
    }
    this.execUser(parsed)
  }

  async init() {
    let contracts = isNil(this.conf.contractTxId)
      ? []
      : is(Array, this.conf.contractTxId)
      ? this.conf.contractTxId
      : [this.conf.contractTxId]

    if (!isNil(this.conf.admin)) {
      if (!isNil(this.conf.admin.contractTxId)) {
        console.log(`Admin Contract: ${this.conf.admin.contractTxId}`)
        contracts.push(this.conf.admin.contractTxId)
      }
      if (!isNil(this.conf.admin.owner)) {
        try {
          this.admin = await Arweave.init().wallets.jwkToAddress(
            this.conf.admin.owner
          )
          console.log(`Admin Account: ${this.admin}`)
        } catch (e) {
          console.log(e)
        }
      }
    }

    for (let v of contracts) this.initSDK(v)

    this.cache.init()

    const server = new grpc.Server()

    server.addService(weavedb.DB.service, {
      query: this.query.bind(this),
    })

    server.bindAsync(
      `0.0.0.0:${this.port}`,
      grpc.ServerCredentials.createInsecure(),
      () => {
        server.start()
      }
    )
    console.log(`server ready on ${this.port}!`)
  }
}

module.exports = { Node }
