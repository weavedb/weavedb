const SDK = require("weavedb-node-client")
const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")
const { addReflection } = require("grpc-server-reflection")
const PROTO_PATH = __dirname + "/weavedb.proto"
const { mergeLeft, isNil, includes, mapObjIndexed, is } = require("ramda")
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
  constructor({ txid, secure, owner, dbname, dir, plugins }) {
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
      params: { txid, secure, owner, dbname, dir, plugins },
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
}

class Server {
  constructor({ port = 9090 }) {
    this.count = 0
    const conf = require(config)
    this.port = port
    const rollups = mergeLeft(
      { __admin__: { secure: true, plugins: {} } },
      conf.rollups || { offchain: {} }
    )
    this.rollups = mapObjIndexed((v, txid) => {
      return new Rollup({
        txid,
        secure: v.secure ?? conf.secure,
        owner: v.owner ?? conf.owner,
        dbname: v.dbname ?? conf.dbname,
        dir: v.dir ?? conf.dir,
        plugins: v.plugins ?? conf.plugins ?? {},
      })
    })(rollups)
    for (let k in this.rollups)
      this.rollups[k].init(async () => {
        if (k === "__admin__") {
          const db = new SDK({ rollup: this.rollups[k] })
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
    this.rollups[txid].execUser(parsed, ++this.count)
  }
}

new Server({ port })
