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
  is,
  hasPath,
} = require("ramda")
const SDK = require("weavedb-sdk-node")
const Client = require("weavedb-node-client")
const { execAdmin } = require("./admin")
const { Node } = require("./Node")
const path = require("path")
class Gateway extends Node {
  constructor({ conf, port, port_manager = 9091 }) {
    super({ conf, port })
    this.port_manager = port_manager
    if (!isNil(this.conf.admin)) {
      this.manager = new Client({
        contractTxId: this.conf.admin.contractTxId,
        rpc: `localhost:${this.port_manager}`,
      })
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
              if (v2 !== this.conf.admin.contractTxId) this.addContract(v2)
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
  async addContract(txid) {
    const contract = await this.db.get("contracts", txid)
    if (contract?.done === true) {
      this.initSDK(txid)
    } else {
      this.pollContract(txid)
    }
  }
  async init() {
    await this.initDB()
    for (let v of this.init_contracts) this.addContract(v)
    this.startServer()
    this.runContractManager()
  }
  async pollContract(txid) {
    console.log("polling..." + txid)
    await this.db.initialize()
    const contract = await this.db.get("contracts", txid)
    if (contract?.err === true) {
      console.log(`contract[${txid}] err!`)
    } else if (contract?.done === true) {
      console.log(`contract[${txid}] cache building complete!`)
      this.initSDK(txid)
    } else {
      setTimeout(() => {
        this.pollContract(txid)
      }, 10000)
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
  runContractManager() {
    const { spawn } = require("node:child_process")
    const ls = spawn("node", [
      path.resolve(__dirname, "../contract-manager-server.js"),
      "--port",
      this.port_manager,
    ])
    ls.stdout.on("data", data => console.log(`manager: ${data}`))
    ls.stderr.on("data", data => console.error(`manager[err]: ${data}`))
    ls.on("close", code => {
      console.log(`child process exited with code ${code}`)
    })
  }
}

module.exports = { Gateway }
