const SDK = require("weavedb-sdk")
const client = require("weavedb-client")
const config = require("./weavedb.config.js")
let sdk = null



const db = new client({
    name: "weavedb",
    version: "1",
    // // contractTxId: "GMLbt7eECqba9MtrufrkMvuBGsSeH92OA8ZZ3yAWU54",
    // // contractTxId: "5HHunI3nBoEExLiWZUd9RLOfbEL8NXHGwgPtcMjnb2Y",
    // // contractTxId: "2ohyMxM2Z2exV4dVLgRNa9jMnEY09H_I-5WkkZBR0Ns", 
    // contractTxId: "DL6Jyvf_5o2qS_lgHJki76Ydx2FN5vb2MEvPkF00rqM", // the wall
    contractTxId: config.contractTxId,    
    // rpc: "http://localhost:8080",
    // rpc: "http://localhost:18080",
    rpc: "https://localhost:9090",
})

console.log("config.contractTxId: ", config.contractTxId)

// const config = require("./weavedb.config.js")
sdk = new SDK(config)
async function main() {
    // const a = await sdk.
    const a = await sdk.get("wall",1)
    const b = await sdk.get("wall",2)
    console.log("a: ", a)
    console.log("a: ", b)

    const c = await db.get("wall", 1)
    console.log("c:" ,c)

}
main()