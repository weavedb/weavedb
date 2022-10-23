// import { mapObjIndexed } from "ramda"
// import client from "weavedb-client"
import WeaveDB from "weavedb-client"
// import WeaveDB from "../client/"


const db = new WeaveDB({
        name: "weavedb",
        version: "1",
        // contractTxId: "GMLbt7eECqba9MtrufrkMvuBGsSeH92OA8ZZ3yAWU54",
        // contractTxId: "5HHunI3nBoEExLiWZUd9RLOfbEL8NXHGwgPtcMjnb2Y",
        // contractTxId: "2ohyMxM2Z2exV4dVLgRNa9jMnEY09H_I-5WkkZBR0Ns", 
        contractTxId: "DL6Jyvf_5o2qS_lgHJki76Ydx2FN5vb2MEvPkF00rqM", // the wall
        
        // rpc: "http://localhost:8080",
        rpc: "localhost:18080",
        // rpc: "https://localhost:9090",
})
async function main() {
    const a = await db.get("wall", 1)
    console.log("a:" ,a)
}

main()