const SDK = require("weavedb-node-client")
const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")
const { addReflection } = require("grpc-server-reflection")
const PROTO_PATH = __dirname + "/weavedb.proto"
const {
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

//const dotenv = require("dotenv")
const { matchFilters } = require("nostr-tools")
const { WebSocketServer } = require("ws")
const {
  purge_interval,
  port_ws = 4736,
  port = 9090,
  config = "./weavedb.nostr.config.js",
} = require("yargs")(process.argv.slice(2)).argv

const weavedb = grpc.loadPackageDefinition(packageDefinition).weavedb
//dotenv.config()

let connCount = 0
let events = []
let subs = new Map()

let lastPurge = Date.now()
if (purge_interval) {
  console.log("Purging events every", purge_interval, "seconds")
  setInterval(() => {
    lastPurge = Date.now()
    events = []
  }, purge_interval * 1000)
}

const path = require("path")
const { fork } = require("child_process")

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
    initial_state,
  }) {
    this.initial_state = initial_state
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
        initial_state: { nostr: "nostr_events" },
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
                initial_state: { nostr: "nostr_events" },
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
  parseQuery2(query, callback) {
    const res = (err, result = null) => {
      callback(null, {
        result: isNil(result) ? null : JSON.stringify(result),
        err,
      })
    }
    const id = "offchain"
    const nocache = true
    let txid, type
    if (!isNil(id)) {
      ;[txid, type] = id.split("#")
    }
    type ??= "offchain"
    console.log(query)
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

  async query2(call, callback) {
    const parsed = this.parseQuery2(call, callback)
    const { type, res, nocache, txid, func, query, isAdmin } = parsed
    if (isNil(this.rollups[txid])) {
      res(`DB [${txid}] doesn't exist`, null)
      return
    }
    this.rollups[txid].execUser(parsed, ++this.count)
  }
}

const server = new Server({ port })

class Instance {
  constructor(socket, server) {
    const conf = require(config)
    this.server = server
    this._socket = socket
    this._subs = new Set()
  }
  cleanup() {
    this._socket.close()

    for (const subId of this._subs) {
      this.removeSub(subId)
    }
  }
  addSub(subId, filters) {
    subs.set(subId, { instance: this, filters })
    this._subs.add(subId)
  }
  removeSub(subId) {
    subs.delete(subId)
    this._subs.delete(subId)
  }
  send(message) {
    this._socket.send(JSON.stringify(message))
  }
  handle(message) {
    try {
      message = JSON.parse(message)
    } catch (e) {
      this.send(["NOTICE", "", "Unable to parse message"])
    }

    let verb, payload
    try {
      ;[verb, ...payload] = message
    } catch (e) {
      this.send(["NOTICE", "", "Unable to read message"])
    }

    const handler = this[`on${verb}`]

    if (handler) {
      handler.call(this, ...payload)
    } else {
      this.send(["NOTICE", "", "Unable to handle message"])
    }
  }
  onCLOSE(subId) {
    this.removeSub(subId)
  }
  onREQ(subId, ...filters) {
    console.log("REQ", subId, ...filters)
    this.addSub(subId, filters)
    let done = 0
    for (const f of filters) {
      let query = ["nostr_events", ["created_at", "desc"]]
      let equals = []
      let ins = []

      for (let f2 of [
        ["id", "id"],
        ["authors", "pubkey"],
        ["kinds", "kind"],
      ]) {
        const f3 = f[f2[0]]
        if (!isNil(f3) && is(Array, f3) && f3.length > 0) {
          if (f3.length === 1) {
            equals.push([f2[1], "==", f3[0]])
          } else {
            ins.push([f2[1], "in", f3])
          }
          if (f2[0] === "id") break
        }
      }
      query = concat(query, equals)
      query = concat(query, ins)
      if (!isNil(f.since) && is(Number, f.since)) {
        query.push(["created_at", "<", f.since])
      }
      if (!isNil(f.until) && is(Number, f.until)) {
        query.push(["created_at", ">", f.until])
      }
      if (!isNil(f.limit) && is(Number, f.limit)) {
        query.push(f.limit > 1000 ? 1000 : f.limit)
      }
      this.server.query2({ query, function: "get" }, (err, res) => {
        try {
          if (isNil(err)) {
            console.log(JSON.parse(res.result).length)
            for (const v of JSON.parse(res.result)) {
              this.send(["EVENT", subId, v])
            }
          }
        } catch (e) {
          console.log(e)
        }
        done++
        if (filters.length === done) {
          console.log("EOSE")
          this.send(["EOSE", subId])
        }
      })
    }
    /*
    for (const event of events) {
      if (matchFilters(filters, event)) {
        console.log("match", subId, event)
        //this.send(["EVENT", subId, event])
      } else {
        console.log("miss", subId, event)
      }
    }*/
  }
  onEVENT(event) {
    events.push(event)
    console.log("EVENT", event, true)
    this.server.query2({ query: event, function: "nostr" }, (err, res) => {
      this.send(["OK", event.id])
      for (const [subId, { instance, filters }] of subs.entries()) {
        if (matchFilters(filters, event)) {
          console.log("match", subId, event)
          instance.send(["EVENT", subId, event])
        }
      }
    })
  }
}

const pid = Math.random().toString().slice(2, 8)
const wss = new WebSocketServer({ port: port_ws })

console.log("Running on port", port_ws)

wss.on("connection", socket => {
  connCount += 1

  console.log("Received connection", { pid, connCount })

  const relay = new Instance(socket, server)

  if (purge_interval) {
    const now = Date.now()
    relay.send([
      "NOTICE",
      "",
      "Next purge in " +
        Math.round((purge_interval * 1000 - (now - lastPurge)) / 1000) +
        " seconds",
    ])
  }

  socket.on("message", msg => relay.handle(msg))
  socket.on("error", e => console.error("Received error on client socket", e))
  socket.on("close", () => {
    relay.cleanup()

    connCount -= 1

    console.log("Closing connection", { pid, connCount })
  })
})
