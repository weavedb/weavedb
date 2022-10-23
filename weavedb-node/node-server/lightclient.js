const WeaveDB = require("weavedb-node-client")

const config = require("./weavedb.config.js")
const db = new WeaveDB({
  name: "weavedb", 
  version: "1", 
  contractTxId: config.contractTxId,
  rpc: "0.0.0.0:9090", // gRPC node IP:port
//   path:"aaa"
//   rpc: "http://0.0.0.0:8083" // gRPC node IP:port
})
async function main() {
    // const a = await sdk.
    const a = await db.get("wall",1)
    const b = await db.get("wall",2, true)
    console.log("a: ", a)
    console.log("a: ", b)

    const c = await db.get("wall", 1)
    console.log("c:" ,c)

}
main()
