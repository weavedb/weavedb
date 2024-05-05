const Arweave = require("arweave")
const SDK = require("weavedb-node-client")
const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")
const { addReflection } = require("grpc-server-reflection")
const PROTO_PATH = __dirname + "/weavedb.proto"
const { Wallet, isAddress } = require("ethers")
const { validate } = require("./lib/validate")
const {
  indexBy,
  prop,
  concat,
  mergeLeft,
  isNil,
  includes,
  mapObjIndexed,
  is,
} = require("ramda")
const { privateToAddress } = require("ethereumjs-util")
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const {
  dbname = null,
  port = 9090,
  config = "./weavedb.standalone.config.js",
} = require("yargs")(process.argv.slice(2)).argv
const weavedb = grpc.loadPackageDefinition(packageDefinition).weavedb
const path = require("path")
const { fork } = require("child_process")
const {
  DeployPlugin,
  ArweaveSigner,
} = require("weavedb-warp-contracts-plugin-deploy")
const { WarpFactory } = require("warp-contracts")

class Rollup {
  constructor({
    txid,
    secure,
    owner,
    dbname,
    dir,
    plugins,
    tick,
    admin,
    bundler,
    contractTxId,
    rollup,
    initial_state = {},
  }) {
    this.cb = {}
    this.txid = txid
    this.db = fork(path.resolve(__dirname, "rollup-mp"))
    this.db.on("message", async ({ err, result, op, id }) => {
      if (!isNil(id)) {
        await this.cb[id]?.(err, result)
        delete this.cb[id]
      } else if (op === "init") {
        console.log(`initialized: ${txid}`)
        if (is(Function, this.afterInit)) this.afterInit()
      }
    })
    this.db.send({
      op: "new",
      params: {
        txid,
        secure,
        owner,
        dbname,
        dir,
        plugins,
        tick,
        admin,
        initial_state,
        bundler,
        contractTxId,
        rollup,
      },
    })
  }
  init(afterInit) {
    this.afterInit = afterInit
    this.db.send({ op: "init" })
  }
  execUser(parsed, id) {
    this.cb[id] = parsed.res
    delete parsed.res
    this.db.send({ op: "execUser", params: parsed, id })
  }
  deployContract(contractTxId, id, res) {
    this.cb[id] = res
    this.db.send({ op: "deploy_contract", contractTxId, id })
  }
  kill() {
    this.db.kill()
  }
}

class Server {
  constructor({ port = 9090 }) {
    this.count = 0
    this.conf = require(config)
    if (!isNil(dbname)) this.conf.dbname = dbname
    // TODO: more prisice validations
    if (!isNil(this.bundler)) throw Error("bundler is not defined")
    if (!isNil(this.owner)) throw Error("owner is not defined")
    if (!isNil(this.admin)) throw Error("admin is not defined")
    if (!isNil(this.rollups)) throw Error("rollups are not defined")
    this.admin = new Wallet(this.conf.admin)
    console.log(`Rollup Admin: ${this.admin.address}`)
    this.rollups = {}
    this.port = port
    this.txid_map = {}
    this.init()
  }
  getRollup(v, txid) {
    return new Rollup({
      txid,
      secure: v.secure ?? this.conf.secure,
      owner: v.owner ?? this.conf.owner,
      dbname: v.dbname ?? this.conf.dbname,
      dir: v.dir ?? this.conf.dir,
      plugins: v.plugins ?? this.conf.plugins ?? {},
      tick: v.tick ?? this.conf.tick ?? null,
      admin: v.admin ?? this.conf.admin,
      initial_state: v.initial_state ?? this.conf.initial_state,
      bundler: this.conf.bundler,
      contractTxId: v.contractTxId ?? null,
      rollup: v.rollup ?? false,
    })
  }
  async init() {
    const admin_db = this.getRollup(
      { secure: true, plugins: {}, owner: this.admin.address.toLowerCase() },
      "__admin__"
    )
    admin_db.init(async () => {
      const auth = { privateKey: this.conf.admin }
      this.admin_db = new SDK({ rollup: admin_db })
      const signer = this.admin.address.toLowerCase()
      const tx = await this.admin_db.setRules(
        {
          "allow write": {
            "==": [{ var: "request.auth.signer" }, signer],
          },
        },
        "dbs",
        auth
      )
      console.log(`__admin__ rules added: ${tx.success}`)
      const rollups = this.conf.rollups || { offchain: {} }
      const dbs = indexBy(prop("id"), await this.admin_db.cget("dbs"))
      for (let k in rollups) {
        if (isNil(dbs[k])) await this.admin_db.set(rollups[k], "dbs", k, auth)
      }
      for (let k in dbs) rollups[k] = dbs[k].data
      for (let k in rollups) {
        if (!isNil(rollups[k].contractTxId)) {
          this.txid_map[rollups[k].contractTxId] = k
        }
        this.rollups[k] = this.getRollup(rollups[k], k)
        this.rollups[k].init()
      }
    })
    this.startServer()
  }

  startServer() {
    const server = new grpc.Server()
    server.addService(weavedb.DB.service, { query: this.query.bind(this) })
    server.bindAsync(
      `0.0.0.0:${this.port}`,
      grpc.ServerCredentials.createInsecure(),
      () => {
        addReflection(
          server,
          path.resolve(__dirname, "./static_codegen/descriptor_set.bin")
        )
        server.start()
      }
    )
    console.log(`server ready on ${this.port}!`)
  }

  parseQuery(call, callback) {
    const res = (err, result = null) => {
      callback(null, {
        result: isNil(result) ? null : JSON.stringify(result),
        err,
      })
    }
    const { method, query, nocache } = call.request
    const [func, id] = method.split("@")
    let txid, type
    if (!isNil(id)) {
      ;[txid, type] = id.split("#")
    }
    type ??= "offchain"
    return { type, nocache, res, txid, func, query, isAdmin: func === "admin" }
  }

  async query(call, callback) {
    try {
      const parsed = this.parseQuery(call, callback)
      const { type, res, nocache, txid, func, query, isAdmin } = parsed
      if (isAdmin) {
        const { op, key, db } = JSON.parse(query).query
        const auth = { privateKey: this.conf.admin }
        let err, signer
        switch (op) {
          case "stats":
            if (isNil(key)) {
              callback(null, {
                result: JSON.stringify({
                  dbs: await this.admin_db.cget("dbs"),
                }),
                err: null,
              })
            } else {
              callback(null, {
                result: JSON.stringify({
                  db: await this.admin_db.cget("dbs", key),
                }),
                err: null,
              })
            }

            break
          case "deploy_contract":
            ;({ err, signer } = await validate(JSON.parse(query), txid))
            if (signer !== this.admin.address.toLowerCase()) {
              callback(null, {
                result: null,
                err: `signer [${signer}] is not admin [${this.admin.address.toLowerCase()}]`,
              })
              return
            } else if (isNil(key)) {
              callback(null, { result: null, err: "key is not specified" })
              return
            } else {
              const _db = await this.admin_db.get("dbs", key)
              if (isNil(_db)) {
                callback(null, { result: null, err: `${key} doesn't exists` })
                return
              } else if (!isNil(_db.contractTxId)) {
                callback(null, {
                  result: null,
                  err: `${_db.contractTxId} already deployed`,
                })
                return
              } else if (_db.rollup !== true) {
                callback(null, {
                  result: null,
                  err: `rollup setting is off, it cannot be changed after deployment`,
                })
                return
              } else {
                const tx_deploy = { success: false }
                const warp = WarpFactory.forMainnet().use(new DeployPlugin())
                const srcTxId = "Ohr4AU6jRUCLoNSTTqu3bZ8GulKZ0V8gUm-vwrRbmS4"
                let res = null
                let err = null
                try {
                  let initialState = {
                    version: "0.37.2",
                    canEvolve: true,
                    evolve: null,
                    secure: true,
                    auth: {
                      algorithms: [
                        "secp256k1",
                        "secp256k1-2",
                        "ed25519",
                        "rsa256",
                      ],
                      name: "weavedb",
                      version: "1",
                      links: {},
                    },
                    crons: {
                      lastExecuted: 0,
                      crons: {},
                    },
                    contracts: {},
                    triggers: {},
                  }
                  const arweave = Arweave.init({
                    host: "arweave.net",
                    port: 443,
                    protocol: "https",
                  })
                  initialState.owner = _db.owner
                  initialState.bundlers = [
                    await arweave.wallets.jwkToAddress(this.conf.bundler),
                  ]
                  initialState.contracts = {
                    dfinity: "3OnjOPuWzB138LOiNxqq2cKby2yANw6RWcQVEkztXX8",
                    ethereum: "Awwzwvw7qfc58cKS8cG3NsPdDet957-Bf-S1RcHry0w",
                    bundler: "lry5KMRj6j13sLHsKxs1D2joLjcj6yNHtNQQQoaHRug",
                    nostr: "PDuTzRpn99EwiUvT9XrUhg8nyhW20Wcd-XcRXboCpHs",
                  }
                  res = await warp.createContract.deployFromSourceTx({
                    wallet: new ArweaveSigner(this.conf.bundler),
                    initState: JSON.stringify(initialState),
                    srcTxId,
                    evaluationManifest: {
                      evaluationOptions: {
                        useKVStorage: true,
                        internalWrites: true,
                        allowBigInt: true,
                      },
                    },
                  })
                } catch (e) {
                  err = e
                  console.log(e)
                }
                if (isNil(res?.contractTxId) || !isNil(err)) {
                  callback(null, {
                    result: null,
                    err: err ?? "unknown error",
                  })
                  return
                } else {
                  const tx = await this.admin_db.update(
                    { contractTxId: res.contractTxId, rollup: true },
                    "dbs",
                    key,
                    auth
                  )
                  console.log(
                    `contract deployed: ${res.contractTxId} [${key}:${tx.success}]`
                  )
                  callback(null, {
                    result: JSON.stringify(res),
                    err,
                  })
                  this.txid_map[res.contractTxId] = key
                  this.rollups[key].deployContract(
                    res.contractTxId,
                    ++this.count,
                    () => {
                      console.log(`contract initialized! ${res.contractTxId}`)
                    }
                  )
                }
              }
            }
            break
          case "add_db":
            ;({ err, signer } = await validate(JSON.parse(query), txid))
            if (signer !== this.admin.address.toLowerCase()) {
              callback(null, {
                result: null,
                err: `signer [${signer}] is not admin [${this.admin.address.toLowerCase()}]`,
              })
              return
            } else if (isNil(key)) {
              callback(null, { result: null, err: "key is not specified" })
              return
            } else if (!isNil(await this.admin_db.get("dbs", key))) {
              callback(null, {
                result: null,
                err: `${key} exists`,
              })
              return
            } else if (isNil(db.owner)) {
              callback(null, { result: null, err: "owner is missing" })
            } else if (!isAddress(db.owner)) {
              callback(null, {
                result: null,
                err: "owner is not a valid EVM address",
              })
            }
            const tx = await this.admin_db.set(db, "dbs", key, auth)
            if (tx.success) {
              this.rollups[key] = new Rollup({
                txid: key,
                secure: db.secure ?? this.conf.secure,
                owner: db.owner ?? this.conf.owner,
                dbname: db.dbname ?? this.conf.dbname,
                dir: db.dir ?? this.conf.dir,
                tick: db.tick ?? this.conf.tick ?? null,
                plugins: db.plugins ?? this.conf.plugins ?? {},
                bundler: this.conf.bundler,
              })
              this.rollups[key].init()
            }
            callback(null, {
              result: tx.success ? JSON.stringify(tx) : null,
              err: tx.success ? null : "error",
            })
            break
          case "update_db":
            ;({ err, signer } = await validate(JSON.parse(query), txid))
            if (signer !== this.admin.address.toLowerCase()) {
              callback(null, {
                result: null,
                err: `signer [${signer}] is not admin [${this.admin.address.toLowerCase()}]`,
              })
              return
            } else if (isNil(key)) {
              callback(null, { result: null, err: "key is not specified" })
              return
            } else if (isNil(await this.admin_db.get("dbs", key))) {
              callback(null, {
                result: null,
                err: `${key} doesn't exist`,
              })
              return
            }
            const tx_3 = await this.admin_db.update(db, "dbs", key, auth)
            callback(null, {
              result: tx_3.success ? JSON.stringify(tx_3) : null,
              err: tx_3.success ? null : "error",
            })
            break

          case "remove_db":
            ;({ err, signer } = await validate(JSON.parse(query), txid))
            if (signer !== this.admin.address.toLowerCase()) {
              callback(null, {
                result: null,
                err: `signer [${signer}] is not admin [${this.admin.address.toLowerCase()}]`,
              })
              return
            } else if (isNil(key)) {
              callback(null, { result: null, err: "key is not specified" })
              return
            } else if (isNil(await this.admin_db.get("dbs", key))) {
              callback(null, {
                result: null,
                err: `${key} doesn't exist`,
              })
              return
            }
            const tx2 = await this.admin_db.delete("dbs", key, auth)
            if (tx2.success) {
              this.rollups[key].kill()
              delete this.rollups[key]
            }
            callback(null, {
              result: tx2.success ? JSON.stringify(tx2) : null,
              err: tx2.success ? null : "error",
            })
            break
          default:
            callback(null, {
              result: null,
              err: "op not found",
            })
        }
      } else {
        if (isNil(this.rollups[this.txid_map[txid] ?? txid])) {
          res(`DB [${txid}] doesn't exist`, null)
          return
        }
        this.rollups[this.txid_map[txid] ?? txid].execUser(parsed, ++this.count)
      }
    } catch (e) {
      console.log(e)
      callback(null, { result: null, err: "unknown error" })
    }
  }
  parseQueryNostr(query, id = "offchain", callback) {
    const res = (err, result = null) => {
      callback(null, {
        result: isNil(result) ? null : JSON.stringify(result),
        err,
      })
    }
    const nocache = true
    let txid, type
    if (!isNil(id)) {
      ;[txid, type] = id.split("#")
    }
    type ??= "offchain"
    return {
      type,
      nocache,
      res,
      txid,
      func: query.function,
      query: JSON.stringify(query.query),
      isAdmin: query.function === "admin",
    }
  }
  async execAdmin({ query, res }) {
    res(null, await this.admin_db.get("dbs"))
    return
  }
  async queryNostr(call, id = "offchain", callback) {
    const parsed = this.parseQueryNostr(call, id, callback)
    const { type, res, nocache, txid, func, query, isAdmin } = parsed
    if (isNil(this.rollups[txid])) {
      res(`DB [${txid}] doesn't exist`, null)
      return
    }
    this.rollups[txid].execUser(parsed, ++this.count)
  }
}

const server = new Server({ port })

if (!isNil(server.conf.nostr)) {
  const { nostr } = require("./nostr")
  nostr({ server, port: server.conf.nostr.port, db: server.conf.nostr.db })
}
