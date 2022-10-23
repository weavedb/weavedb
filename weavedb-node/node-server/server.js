const config = require("./weavedb.config.js")
// const PROTO_PATH = __dirname + "/../weavedb.proto"
const PROTO_PATH = __dirname + "/../weavedb.proto"
let sdk = null

const { isNil, includes } = require("ramda")
const SDK = require("weavedb-sdk")
const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const weavedb = grpc.loadPackageDefinition(packageDefinition).weavedb

let _cache = {}

async function query(call, callback) {
  const { method, query, nocache, path } = call.request
  console.log("call.request: ", call.request)
  console.log("method: ", method)
  console.log("query: ", query)
  console.log("path: ", path)
  console.log("nocache: ", nocache)
  // console.log("call: ", call)
  const start = Date.now()
  const key = `${query}`

  let result = null
  let err = null
  let end

  function cb(result, err) {
    callback(null, {
      result: JSON.stringify(result),
      err: err,
    })
  }

  const sendQuery = async () => {
    try {
      if (
        includes(method)([
          "get",
          "cget",
          "getIndexes",
          "getCrons",
          "getSchema",
          "getRules",
          "getNonce",
          "getIds",
        ])
      ) {
        result = await sdk[method](...JSON.parse(query))
        _cache[key] = { date: Date.now(), result }
      } else {
        let dryState = await sdk.db.dryWrite(JSON.parse(query))
        if (dryState.type === "error")
          return { result: null, err: dryState.errorMessage }
        result = await sdk.send(JSON.parse(query), true)
      }
    } catch (e) {
      err = e.message
    }
    return { result, err }
  }
  if (method === "get" && !isNil(_cache[key]) && !nocache) {
    result = _cache[key].result
    cb(result, err)
    await sendQuery()
  } else {
    ;({ result, err } = await sendQuery())
    cb(result, err)
  }
}


function sayHello(call, callback) {
  console.log("sayHello:")

  const { method, query, nocache, path } = call.request
  console.log("call.request: ", call.request)
  console.log("method: ", method)
  console.log("query: ", query)
  console.log("path: ", path)
  console.log("name: ", name)
  console.log("nocache: ", nocache)
  callback(null, {message: 'Hello ' + call.request.name});
}
function ping(call, callback) {
  // console.log("ping: " , call)  
  callback(null, {message: 'pong '});
}

async function main() {
  sdk = new SDK(config)
  console.log("config.contractTxId: ", config.contractTxId)
  const server = new grpc.Server()

  server.addService(weavedb.DB.service, {
    query,
    ping,
    sayHello
  })

  server.bindAsync(
    "0.0.0.0:8080",
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log("8080")
      server.start()
    }
  )

  console.log("initializing sdk...")
  await sdk.get("conf")
  console.log("sdk ready!")
}

main()
