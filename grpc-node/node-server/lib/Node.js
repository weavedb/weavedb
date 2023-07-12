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
const { addReflection } = require("grpc-server-reflection")
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
    this.results = {}
    this.timeouts = {}
    this.start = Date.now()
    this.conf = conf
    this.port = port
    this.sdks = {}
    this.lastChecked = {}
    this.polling = {}
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

      // cache doesn't have to be redis?
      // this is offchain <= need redis for sync
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
      console.log(result)
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
          this.lastChecked[txid] < date - 1000 * 60 * 10 ||
          !isNil(this.polling[txid])
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

  async setSDK(txid, old, no_snapshot) {
    let _conf = clone(this.conf)
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
    }
    __conf.progress = async input => {
      this.progresses[txid].current = input.currentInteraction
      this.progresses[txid].all = input.allInteractions
      if (this.last_reported < Date.now() - 1000 * 10) {
        this.last_reported = Date.now()
        this.calcProgress()
      }
      if ((this.progresses[txid].last_checked || 0) < Date.now() - 1000 * 10) {
        this.progresses[txid].last_checked = Date.now()
        await this.db.set(this.progresses[txid], "contracts", txid, {
          ar: this.conf.admin.owner,
        })
      }
    }
    __conf.logLevel = "none"
    __conf.subscribe = this.conf.admin?.contractTxId === txid
    this.sdks[txid] = new SDK(__conf)
    if (isNil(_conf.wallet)) await this.sdks[txid].initializeWithoutWallet()
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

  async readState(txid, attempt = 1) {
    try {
      await this.sdks[txid].readState()
    } catch (e) {
      console.log(`readState(${txid}) error! attempt #${attempt}`)
      if (attempt < 5) {
        await this.readState(txid, ++attempt)
      } else {
        throw new Error(e)
      }
    }
  }

  async initSDK(v, no_snapshot = false) {
    console.log("initializing contract..." + v)
    let [txid, old] = v.split("@")
    this.progresses[txid] ||= {
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
        await this.db.set(this.progresses[txid], "contracts", v, {
          ar: this.conf.admin.owner,
        })
      }
    }
    await this.updateState(txid, old, no_snapshot)
  }

  setUpdate(txid, old) {
    clearTimeout(this.timeouts[txid])
    this.timeouts[txid] = setTimeout(async () => {
      console.log(`updating snapshot[${txid}]`)
      await this.updateState(txid, old, false, true, true)
    }, this.conf.snapshot_span || 1000 * 60 * 60 * 3)
  }

  async healthcheck(txid) {
    try {
      const json = await fetch(
        `https://dre-1.warp.cc/contract?id=${txid}&query=hash`
      ).then(v => v.json())
      const remote_hash = json.result[0]
      const sortKey = json.sortKey
      if (!isNil(remote_hash)) {
        const lastStoredKey = (
          await this.sdks[txid].warp.stateEvaluator.latestAvailableState(txid)
        )?.sortKey
        if (lastStoredKey === sortKey) {
          const local_hash = await this.sdks[txid].getHash()
          if (local_hash === remote_hash) {
            console.log(`hash valid (${txid})`)
            await this.saveSnapShot(txid, "valid")
            this.progresses[txid].valid = lastStoredKey
            this.progresses[txid].invalid = false
          } else {
            console.log(`hash broken (${txid})`)
            let invalid = this.progresses[txid].invalid
            if (isNil(invalid) || !invalid) this.progresses[txid].invalid = 0
            this.progresses[txid].invalid += 1
            if (this.progresses[txid].invalid < 3) {
              delete this.sdks[txid]
              const cache_type = this.conf.cache || "lmdb"
              if (cache_type === "redis") {
                try {
                  const prefix =
                    isNil(this.conf.redis) || isNil(this.conf.redis.prefix)
                      ? "warp"
                      : this.conf.redis.prefix
                  for (const key of await this.redis.KEYS(
                    `${prefix}.${txid}.*`
                  )) {
                    await this.redis.del(key)
                  }
                } catch (e) {}
              } else if (cache_type === "lmdb") {
                await this.snapshot.delete(txid)
              }
              this.initSDK(txid)
            }
          }
        }
      }
    } catch (e) {}
  }

  async saveSnapShot(txid, suffix = null) {
    if (this.isLmdb) await this.snapshot.save(txid, undefined, suffix)
    if (this.isRedis) await this.snapshot.save(txid, this.redis, suffix)
  }

  async updateState(txid, old, no_snapshot, no_admin, update) {
    try {
      if (isNil(this.progresses[txid])) {
        this.progresses[txid] = {
          current: 0,
          all: 0,
          done: false,
          err: false,
          start: Date.now(),
          last_checked: 0,
        }
      }
      this.progresses[txid].start = Date.now()
      if (isNil(this.sdks[txid])) await this.setSDK(txid, old, no_snapshot)
      await this.readState(txid)
      if (!no_snapshot) await this.saveSnapShot(txid)
      this.progresses[txid].done = true
      this.progresses[txid].current = this.progresses[txid].all
      console.log(`sdk(${txid}) ${update ? "updated" : "ready"}!`)
      await this.healthcheck(txid)
      this.calcProgress()
      if (!isNil(this.conf.admin) && no_admin !== true) {
        await this.db.set(this.progresses[txid], "contracts", txid, {
          ar: this.conf.admin.owner,
        })
        if (
          !no_snapshot &&
          !isNil(this.conf.admin.contractTxId) &&
          this.conf.admin.contractTxId === txid
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
              } else {
                this.setUpdate(v2, false)
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      await this.errSDK(txid, e)
    }
    this.setUpdate(txid, old)
  }

  async errSDK(txid, e) {
    console.log(`sdk(${txid}) error!`)
    console.log(e)
    this.progresses[txid].err = true
    this.calcProgress()
    await this.db.set(this.progresses[txid], "contracts", txid, {
      ar: this.conf.admin.owner,
    })
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
        addReflection(server, "./static_codegen/descriptor_set.bin")
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
          if (func === "get") result = isNil(result) ? null : result.data
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
        let virtual_txid = null
        const cache = _onDryWrite?.cache || true
        const onDryWrite = nocache
          ? null
          : {
              cb: _res => {
                delete _res.state
                res(null, _res)
                virtual_txid = _res?.result?.transaction?.id || null
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
        if (!isNil(virtual_txid)) this.results[virtual_txid] = result
      }
    } catch (e) {
      console.log(e)
      err =
        typeof e === "string"
          ? e
          : typeof e.message === "string"
          ? e.message
          : "unknown error"
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
