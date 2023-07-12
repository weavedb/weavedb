const Arweave = require("arweave")
const { clone, isNil, pluck } = require("ramda")
const SDK = require("weavedb-sdk-node")
const DB = require("weavedb-offchain")
const {
  port = 9090,
  config = "./weavedb.config.js",
  contractTxId,
} = require("yargs")(process.argv.slice(2)).argv
console.log(contractTxId)

/*
new (require("./lib/ContractManager").ContractManager)({
  conf: require(config),
  port,
}).init()
*/

class Loader {
  constructor({ contractTxId, conf }) {
    const [txid, old] = contractTxId.split("@")
    this.conf = conf
    this.txid = txid
    this.old = old
    this.isLmdb = (conf.cache || "lmdb") === "lmdb"
    this.progress = {
      current: 0,
      all: 0,
      done: false,
      err: false,
      start: Date.now(),
      last_checked: 0,
    }
    console.log("initializing contract..." + contractTxId)
  }

  async initDB() {
    this.admin = await Arweave.init().wallets.jwkToAddress(
      this.conf.admin.owner
    )
    console.log(`Admin Account: ${this.admin}`)
    this.db = new DB({
      state: { owner: this.admin, secure: false },
    })
    await this.db.initialize()
  }

  async initSDK(v, no_snapshot = false) {
    await this.initDB()
    if (!isNil(this.conf.admin)) {
      const stat = await this.db.get("contracts", v)
      if (isNil(stat) || no_snapshot === true) {
        await this.db.set(this.progress, "contracts", v, {
          ar: this.conf.admin.owner,
        })
      }
    }
    await this.updateState(no_snapshot)
  }

  async readState(attempt = 1) {
    try {
      const res = await this.sdk.readState()
      return res !== null
    } catch (e) {
      console.log(`readState(${this.txid}) error! attempt #${attempt}`)
      if (attempt < 5) {
        await this.readState(this.txid, ++attempt)
      } else {
        throw new Error(e)
      }
    }
  }

  async updateState(no_snapshot, no_admin, update) {
    try {
      this.progress.start = Date.now()
      if (isNil(this.sdk)) await this.setSDK(no_snapshot)
      if (!(await this.readState())) {
        console.log(`${this.txid} doesn't exist`)
        process.exit()
      }
      //if (!no_snapshot) await this.saveSnapShot()
      this.progress.done = true
      this.progress.current = this.progress.all
      console.log(`sdk(${this.txid}) ${update ? "updated" : "ready"}!`)
      process.exit()
      //await this.healthcheck(txid)
      //this.calcProgress()
      /*
      if (!isNil(this.conf.admin) && no_admin !== true) {
        await this.db.set(this.progress, "contracts", this.txid, {
          ar: this.conf.admin.owner,
        })
        if (
          !no_snapshot &&
          !isNil(this.conf.admin.contractTxId) &&
          this.conf.admin.contractTxId === this.txid
        ) {
          try {
            const contracts = await this.sdk.get("contracts")
            this.admin_sdk = this.sdk
            for (const v2 of pluck("txid", contracts)) {
              const contract = await this.db.get("contracts", v2)
              if (
                v2 !== this.conf.admin.contractTxId &&
                contract?.done !== true
              ) {
                //this.initSDK(v2)
              } else {
                //this.setUpdate(v2, false)
              }
            }
          } catch (e) {}
        }
      }*/
    } catch (e) {
      await this.errSDK(e)
    }
    this.setUpdate()
  }

  async setSDK(no_snapshot) {
    let _conf = clone(this.conf)
    _conf.contractTxId = this.txid
    if (this.old === "old") _conf.old = true
    if (this.isLmdb) {
      const loc = suffix => ({
        dbLocation: `./cache/warp/${this.txid}/${suffix}`,
      })
      _conf.lmdb = {
        state: loc("state"),
        contracts: loc("contracts"),
        src: loc("src"),
      }
      //if (!no_snapshot) await this.snapshot.recover(this.txid)
    } else if (this.isRedis) {
      //if (!no_snapshot) await this.snapshot.recoverRedis(this.txid, this.redis)
    }
    let __conf = clone(_conf)
    if (__conf.cache === "redis") {
      __conf.redis ||= {}
      __conf.redis.client = this.redis
    }
    __conf.progress = async input => {
      this.progress.current = input.currentInteraction
      this.progress.all = input.allInteractions
      console.log(
        `[${this.progress.current}/${this.progress.all} (${Math.floor(
          (this.progress.current / this.progress.all) * 100
        )}%)] ${this.txid}`
      )
      if (this.last_reported < Date.now() - 1000 * 10) {
        this.last_reported = Date.now()
        //this.calcProgress()
      }
      if ((this.progress.last_checked || 0) < Date.now() - 1000 * 10) {
        this.progress.last_checked = Date.now()
        await this.db.set(this.progress, "contracts", this.txid, {
          ar: this.conf.admin.owner,
        })
      }
    }
    //__conf.logLevel = "none"
    __conf.subscribe = this.conf.admin?.contractTxId === this.txid
    this.sdk = new SDK(__conf)
    if (isNil(_conf.wallet)) await this.sdk.init()
  }
  async errSDK(e) {
    console.log(`sdk(${this.txid}) error!`)
    console.log(e)
    this.progress.err = true
    //this.calcProgress()
    await this.db.set(this.progress, "contracts", this.txid, {
      ar: this.conf.admin.owner,
    })
  }

  setUpdate() {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(async () => {
      console.log(`updating snapshot[${this.txid}]`)
      await this.updateState(false, true, true)
    }, this.conf.snapshot_span || 1000 * 60 * 60 * 3)
  }
}

const loader = new Loader({ contractTxId, conf: require(config) })
loader.initSDK()
