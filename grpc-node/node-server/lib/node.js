const {
  append,
  isEmpty,
  compose,
  flatten,
  o,
  values,
  mapObjIndexed,
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
      this.isRedis = true
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
      } else if (this.isRedis) {
        if (!no_snapshot) await this.snapshot.recoverRedis(txid, this.redis)
      }
      let __conf = clone(_conf)
      if (__conf.cache === "redis") {
        __conf.redis ||= {}
        __conf.redis.client = this.redis
        __conf.onUpdate = async (state, query, cache) => {
          if (!isNil(this.redis)) {
            if (cache.deletes.length) {
              try {
                await this.redis.del(cache.deletes)
              } catch (e) {}
            }
            if (!isEmpty(cache.updates)) {
              try {
                const tx = await this.redis.MSET(
                  compose(
                    flatten,
                    values,
                    mapObjIndexed((v, k) => [k, JSON.stringify(v)])
                  )(cache.updates)
                )
              } catch (e) {
                console.log(e)
              }
            }
          }
        }
      }
      this.sdks[txid] = new SDK(__conf)
      if (isNil(_conf.wallet)) await this.sdks[txid].initializeWithoutWallet()
      await this.sdks[txid].db.readState()
      if (this.isLmdb && !no_snapshot) await this.snapshot.save(txid)
      if (this.isRedis && !no_snapshot) {
        await this.snapshot.save(txid, this.redis)
      }
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

  async sendQuery({ func, txid, nocache, query, res }, key) {
    let result = null
    let err = null
    let dryWrite = false
    try {
      if (func === "getNonce") {
        result = await this.sdks[txid].getNonce(...JSON.parse(query))
      } else if (key.func === "cget") {
        if (nocache) {
          result = await this.sdks[txid].cget(...JSON.parse(query), true)
        } else {
          result = await this.sdks[txid].cgetCache(...JSON.parse(query))
        }
        if (key.type === "collection") {
          this.cache.set(key.key, pluck("id", result))
          if (result.length) {
            this.redis.MSET(
              o(
                flatten,
                map(v => [
                  SDK.getKey(
                    txid,
                    "cget",
                    append(v.id, key.path),
                    this.conf.cache_prefix
                  ),
                  JSON.stringify(v),
                ])
              )(result)
            )
          }
          if (func === "get") result = pluck("data", result)
        } else {
          if (func === "get") result = result.data
          this.cache.set(key.key, result)
        }
      } else if (includes(func)(this.sdks[txid].reads)) {
        let _query = query === `""` ? [] : JSON.parse(query)
        if (includes(func)(["getVersion"]) || nocache) {
          try {
            _query.push(true)
          } catch (e) {
            console.log(e)
          }
        }
        result = await this.sdks[txid][key.func](..._query)
        this.cache.set(key.key, result)
      } else {
        dryWrite = !nocache
        const onDryWrite = nocache
          ? null
          : {
              cb: _res => {
                delete _res.state
                console.log(_res)
                res(null, _res)
              },
              cache: true,
            }
        result = await this.sdks[txid].write(
          key.func,
          JSON.parse(query),
          true,
          true,
          false,
          onDryWrite
        )
      }
    } catch (e) {
      err = e.message
    }
    return { result, err, dryWrite }
  }

  async execUser(parsed) {
    const { res, nocache, txid, func, query } = parsed
    const _query = JSON.parse(query)
    const key = SDK.getKeyInfo(
      txid,
      !isNil(_query.query) ? _query : { function: func, query: _query },
      this.conf.cache_prefix
    )
    let data = null
    if (
      !nocache &&
      func !== "getNonce" &&
      key.func === "cget" && // need to remove this later
      includes(func)(this.sdks[txid].reads)
    ) {
      try {
        data = await this.cache.get(key.key)
        if (!isNil(data)) {
          if (
            key.func === "cget" &&
            key.type === "collection" &&
            data.length !== 0
          ) {
            data = map(
              JSON.parse,
              await this.redis.MGET(
                map(v =>
                  SDK.getKey(
                    txid,
                    "cget",
                    append(v, key.path),
                    this.conf.cache_prefix
                  )
                )(data)
              )
            )
            if (includes(null, data)) {
              data = null
            } else if (func === "get") {
              data = pluck("data", data)
            }
          }
        }
      } catch (e) {}

      if (!isNil(data)) {
        res(null, data)
        return await this.sendQuery(parsed, key)
      }
    }
    let result, err, dryWrite
    ;({ result, err } = await this.sendQuery(parsed, key))
    if (!dryWrite) res(err, result)
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
