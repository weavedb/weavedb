const Arweave = require("arweave")
const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")
const { addReflection } = require("grpc-server-reflection")
const PROTO_PATH = __dirname + "/weavedb.proto"
const {
  isNil,
  is,
  pluck,
  o,
  flatten,
  map,
  append,
  includes,
  concat,
} = require("ramda")
const DB = require("weavedb-offchain")
const Warp = require("weavedb-sdk-node")
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const { port = 9090, config = "./weavedb.standalone.config.js" } =
  require("yargs")(process.argv.slice(2)).argv
const weavedb = grpc.loadPackageDefinition(packageDefinition).weavedb
const { open } = require("lmdb")
const path = require("path")
const EthCrypto = require("eth-crypto")

class Standalone {
  constructor({ port = 9090, conf }) {
    this.conf = conf
    this.port = port
    this.txs = []
    this.tx_count = 0
    this.bundling = null
    this.bundler = EthCrypto.createIdentity()
    console.log(`Bundler: ${this.bundler.address}`)
  }
  async init() {
    await this.initDB()
    this.startServer()
    this.bundle()
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
  async bundle() {
    const len = 1
    try {
      if (this.txs.length >= len) {
        this.bundling = this.txs.splice(0, len)
        console.log(`bundling...${pluck("id")(this.bundling)}`)
        const result = await this.warp.bundle(this.bundling, {
          privateKey: this.bundler.privateKey,
        })
        console.log(result.success)
        if (result.success !== true) this.txs = concat(this.bundling, this.txs)
      }
    } catch (e) {
      console.log(e)
    }
    setTimeout(() => this.bundle(), 3000)
  }
  async initDB() {
    this.admin = await Arweave.init().wallets.jwkToAddress(
      this.conf.admin.owner
    )
    console.log(`Admin Account: ${this.admin}`)
    this.db = new DB({
      type: 3,
      cache: {
        initialize: async obj =>
          (obj.lmdb = open({
            path: path.resolve(
              __dirname,
              "cache",
              `${this.conf.dbname ?? "weavedb"}${
                isNil(this.conf.contractTxId)
                  ? ""
                  : `-${this.conf.contractTxId}`
              }`
            ),
          })),
        onWrite: async (tx, obj, param) => {
          let prs = []
          for (const k in tx.result.kvs)
            prs.push(obj.lmdb.put(k, tx.result.kvs[k]))
          await Promise.all(prs)
          this.txs.push({
            id: ++this.tx_count,
            txid: tx.result.transaction.id,
            param,
          })
        },
        get: async (key, obj) => await obj.lmdb.get(key),
      },
      state: { owner: this.admin, secure: false },
    })
    await this.db.initialize()
    if (!isNil(this.conf.contractTxId)) {
      console.log(`contractTxId: ${this.conf.contractTxId}`)
      this.warp = new Warp({
        type: 3,
        contractTxId: this.conf.contractTxId,
        remoteStateSyncEnabled: false,
      })
      await this.warp.init()
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

  async query(call, callback) {
    let parsed = this.parseQuery(call, callback)
    const { res, nocache, txid, func, query, isAdmin } = parsed
    //return res(null, null)
    this.execUser(parsed)
  }
  async execUser(parsed) {
    const { res, nocache, txid, func, query } = parsed
    const _query = JSON.parse(query)
    const key = DB.getKeyInfo(
      txid,
      !isNil(_query.query) ? _query : { function: func, query: _query },
      this.conf.cache_prefix
    )
    let data = null
    let result, err, dryWrite
    ;({ result, err, dryWrite } = await this.sendQuery(parsed, key))
    //if (!dryWrite) res(err, result)
    res(err, result)
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
        result = await this.db.getNonce(..._query)
      } else if (key.func === "cget") {
        if (nocache) {
          result = await this.db.cget(..._query, true)
        } else {
          result = await this.db.cget(..._query)
        }
        if (key.type === "collection") {
          if (func === "get") result = pluck("data", result)
        } else {
          if (func === "get") result = isNil(result) ? null : result.data
        }
      } else if (includes(func)(this.db.reads)) {
        if (includes(func)(["getVersion"]) || nocache) {
          try {
            _query.push(true)
          } catch (e) {
            console.log(e)
          }
        }
        result = await this.db[key.func](..._query)
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
        result = await this.db.write(
          key.func,
          _query,
          true,
          true,
          false,
          onDryWrite
        )
        //if (!isNil(virtual_txid)) this.results[virtual_txid] = result
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
}

const db = new Standalone({ port, conf: require(config) })

db.init()
