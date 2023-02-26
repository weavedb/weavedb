const Cache = require("./cache")
const Snapshot = require("./snapshot")
const Arweave = require("arweave")
const DB = require("weavedb-offchain")
const {
  flatten,
  append,
  keys,
  pluck,
  clone,
  compose,
  sum,
  prop,
  filter,
  propEq,
  values,
  o,
  map,
  of,
  unless,
  includes,
  is,
  isNil,
} = require("ramda")
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
const SDK = require("weavedb-sdk-node")

class Node {
  constructor({ conf, port }) {
    this.start = Date.now()
    this.conf = conf
    this.port = port
    this.sdks = {}
    this.lastChecked = {}
    this.initRedis()
    this.cache = new Cache(conf, this.redis)
    this.snapshot = new Snapshot(conf)
    this.isLmdb = (conf.cache || "lmdb") === "lmdb"
    this.progresses = {}
    this.last_reported = 0
  }

  async initDB() {
    this.init_contracts = isNil(this.conf.contractTxId)
      ? []
      : is(Array, this.conf.contractTxId)
      ? this.conf.contractTxId
      : [this.conf.contractTxId]

    if (!isNil(this.conf.admin)) {
      if (!isNil(this.conf.admin.contractTxId)) {
        console.log(`Admin Contract: ${this.conf.admin.contractTxId}`)
        this.init_contracts.push(this.conf.admin.contractTxId)
      }
      this.admin = await Arweave.init().wallets.jwkToAddress(
        this.conf.admin.owner
      )
      console.log(`Admin Account: ${this.admin}`)
      this.db = new DB({
        state: { owner: this.admin, secure: false },
        cache: "redis",
        redis: {
          prefix: this.conf.offchain_db?.prefix,
          url: this.conf.offchain_db?.url || null,
        },
      })
      await this.db.initialize()
    }
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

  async rateLimit(txid) {
    if (!isNil(this.conf.redis) && !isNil(this.conf.ratelimit?.every)) {
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

  calcProgress() {
    const len = keys(this.progresses).length
    const ongoing = map(
      filter(v => propEq("err", false)(v)),
      values
    )(this.progresses)
    const all = compose(sum, map(prop("all")))(ongoing)
    const current = compose(sum, map(prop("current")))(ongoing)
    const err = map(filter(propEq("err", true)), values)(this.progresses).length
    const done = map(
      filter(propEq("done", true)),
      values
    )(this.progresses).length
    console.log(
      `done: ${done}, err: ${err}, total: ${len} contracts | ${current} / ${all} txs (${
        all === 0 ? "-" : Math.floor((current / all) * 100)
      }%) | ${Math.round((Date.now() - this.start) / 1000)} sec`
    )
    if (all === 0 && done + err === len) {
      console.log("all contracts have been initiated!")
    }
    return { len, err, done, all, current }
  }

  async initSDK(v, no_snapshot = false) {
    console.log("initializing contract..." + v)
    this.progresses[v] = {
      current: 0,
      all: 0,
      done: false,
      err: false,
      start: Date.now(),
      last_checked: 0,
    }
    if (!isNil(this.conf.admin)) {
      const stat = await this.db.get("contracts", v)
      if (isNil(stat) || no_snapshot === true) {
        await this.db.set(this.progresses[v], "contracts", v, {
          ar: this.conf.admin.owner,
        })
      }
    }
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
        __conf.progress = async input => {
          this.progresses[v].current = input.currentInteraction
          this.progresses[v].all = input.allInteractions
          if (this.last_reported < Date.now() - 1000 * 10) {
            this.last_reported = Date.now()
            this.calcProgress()
          }
          if (v.last_checked < Date.now() - 1000 * 10) {
            await this.db.set(this.progresses[v], "contracts", v, {
              ar: this.conf.admin.owner,
            })
          }
        }
        __conf.logLevel = "none"
        __conf.subscribe = false
      }
      this.sdks[txid] = new SDK(__conf)
      if (isNil(_conf.wallet)) await this.sdks[txid].initializeWithoutWallet()
      await this.sdks[txid].db.readState()
      if (this.isLmdb && !no_snapshot) await this.snapshot.save(txid)
      if (this.isRedis && !no_snapshot) {
        await this.snapshot.save(txid, this.redis)
      }
      this.progresses[v].done = true
      this.progresses[v].current = this.progresses[v].all
      console.log(`sdk(${v}) ready!`)
      this.calcProgress()
      if (!isNil(this.conf.admin)) {
        await this.db.set(this.progresses[v], "contracts", v, {
          ar: this.conf.admin.owner,
        })
        if (
          !no_snapshot &&
          !isNil(this.conf.admin.contractTxId) &&
          this.conf.admin.contractTxId === v
        ) {
          try {
            const contracts = await this.sdks[txid].get("contracts")
            this.admin_sdk = this.sdks[txid]
            for (const v2 of pluck("txid", contracts)) {
              const contract = await this.db.get("contracts", v2)
              if (
                v2 !== this.conf.admin.contractTxId &&
                contract?.done !== true
              ) {
                this.initSDK(v2)
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      this.progresses[v].err = true
      console.log(`sdk(${v}) error!`)
      success = false
      this.calcProgress()
      await this.db.set(this.progresses[v], "contracts", v, {
        ar: this.conf.admin.owner,
      })
    }
    return success
  }

  startServer() {
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

  async sendQuery({ func, txid, nocache, query, res }, key) {
    let result = null
    let err = null
    let dryWrite = false
    let _onDryWrite = null
    try {
      let _query = query === `""` ? [] : JSON.parse(query)
      if (is(Object, _query) && is(Object, _query.dryWrite)) {
        _onDryWrite = _query.dryWrite
        delete _query.dryWirte
      }
      if (func === "getNonce") {
        result = await this.sdks[txid].getNonce(..._query)
      } else if (key.func === "cget") {
        if (nocache) {
          result = await this.sdks[txid].cget(..._query, true)
        } else {
          result = await this.sdks[txid].cget(..._query)
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
        const cache = _onDryWrite?.cache || true
        const onDryWrite = nocache
          ? null
          : {
              cb: _res => {
                delete _res.state
                res(null, _res)
              },
              cache,
              read: _onDryWrite?.read || null,
            }
        result = await this.sdks[txid].write(
          key.func,
          _query,
          true,
          true,
          false,
          onDryWrite
        )
      }
    } catch (e) {
      console.log(e)
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
    /*
    if (
      !nocache &&
      func !== "getNonce" &&
      key.func === "cget" && // need to remove this later
      includes(func)(this.sdks[txid].reads)
    ) {
      try {
        //data = await this.cache.get(key.key)
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
        console.log("perhaps....................", data)
        res(null, data)
        return await this.sendQuery(parsed, key)
      }
      }
    */
    let result, err, dryWrite
    ;({ result, err, dryWrite } = await this.sendQuery(parsed, key))
    if (!dryWrite) res(err, result)
  }
}

module.exports = { Node }
