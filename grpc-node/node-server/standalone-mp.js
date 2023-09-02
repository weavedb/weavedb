const SDK = require("weavedb-node-client")
const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")
const { addReflection } = require("grpc-server-reflection")
const PROTO_PATH = __dirname + "/weavedb.proto"
const { mergeLeft, isNil, includes, mapObjIndexed, is } = require("ramda")
const { privateToAddress } = require("ethereumjs-util")
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
const path = require("path")
const { fork } = require("child_process")

class Rollup {
  constructor({ txid, secure, owner, dbname, dir, plugins, tick, admin }) {
    this.cb = {}
    this.txid = txid
    this.db = fork(path.resolve(__dirname, "rollup-mp"))
    this.db.on("message", async ({ err, result, op, id }) => {
      if (!isNil(id)) {
        await this.cb[id](err, result)
        delete this.cb[id]
      } else if (op === "init") {
        console.log(`initialized: ${txid}`)
        if (is(Function, this.afterInit)) this.afterInit()
      }
    })
    this.db.send({
      op: "new",
      params: { txid, secure, owner, dbname, dir, plugins, tick, admin },
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
  kill() {
    this.db.kill()
  }
}

class Server {
  constructor({ port = 9090 }) {
    this.count = 0
    this.conf = require(config)
    this.port = port
    const rollups = mergeLeft(
      { __admin__: { secure: true, plugins: {} } },
      this.conf.rollups || { offchain: {} }
    )
    this.rollups = mapObjIndexed((v, txid) => {
      return new Rollup({
        txid,
        secure: v.secure ?? this.conf.secure,
        owner: v.owner ?? this.conf.owner,
        dbname: v.dbname ?? this.conf.dbname,
        dir: v.dir ?? this.conf.dir,
        plugins: v.plugins ?? this.conf.plugins ?? {},
        tick: v.tick ?? this.conf.tick ?? null,
        admin: v.admin ?? this.conf.admin,
      })
    })(rollups)
    for (let k in this.rollups)
      this.rollups[k].init(async () => {
        if (k === "__admin__") {
          const auth = { privateKey: this.conf.admin }
          this.admin_db = new SDK({ rollup: this.rollups[k] })
          const signer = `0x${privateToAddress(
            Buffer.from(this.conf.admin.toLowerCase().replace(/^0x/, ""), "hex")
          ).toString("hex")}`
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
          for (let k in rollups) {
            if (k !== "__admin__") {
              const tx = await this.admin_db.set(rollups[k], "dbs", k, auth)
              console.log(`DB ${k} added: ${tx.success}`)
            }
          }
          const dbs = await this.admin_db.cget("dbs")
          for (let v of dbs) {
            if (isNil(this.rollups[v.id])) {
              const key = v.id
              this.rollups[key] = new Rollup({
                txid: key,
                secure: v.secure ?? this.conf.secure,
                owner: v.owner ?? this.conf.owner,
                dbname: v.dbname ?? this.conf.dbname,
                dir: v.dir ?? this.conf.dir,
                plugins: v.plugins ?? this.conf.plugins ?? {},
                tick: v.tick ?? this.conf.tick ?? null,
                admin: v.admin ?? this.conf.admin,
              })
              this.rollups[key].init()
            }
          }
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
    const parsed = this.parseQuery(call, callback)
    const { type, res, nocache, txid, func, query, isAdmin } = parsed
    if (isNil(this.rollups[txid])) {
      res(`DB [${txid}] doesn't exist`, null)
      return
    }
    if (isAdmin) {
      const { op, key, db } = JSON.parse(query).query
      const auth = { privateKey: this.conf.admin }
      switch (op) {
        case "add_db":
          if (!isNil(await this.admin_db.get("dbs", key))) {
            callback(null, {
              result: null,
              err: `${key} exists`,
            })
            return
          }
          const tx = await this.admin_db.set(db, "dbs", key, auth)
          if (tx.success) {
            this.rollups[key] = new Rollup({
              txid: key,
              secure: db.secure ?? this.conf.secure,
              owner: db.owner ?? this.conf.owner,
              dbname: db.dbname ?? this.conf.dbname,
              dir: db.dir ?? this.conf.dir,
              plugins: db.plugins ?? this.conf.plugins ?? {},
            })
            this.rollups[key].init()
          }
          callback(null, {
            result: tx.success ? JSON.stringify(tx) : null,
            err: tx.success ? null : "error",
          })
          break
        case "remove_db":
          if (isNil(await this.admin_db.get("dbs", key))) {
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
      this.rollups[txid].execUser(parsed, ++this.count)
    }
  }
}

new Server({ port })
