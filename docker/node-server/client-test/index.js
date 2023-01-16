

console.log("client-test")
import WeaveDB from "weavedb-node-client"

import config from './weavedb.config3.js'
// console.log("config: ", config)

const sdk = new WeaveDB({
    contractTxId: config.contractTxId,
    rpc: "localhost:8080",
    arweave_wallet: config.arweave_wallet,
})
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log("main start..")
    
    console.log("await sdk.setRules({ 'allow write': true }, 'test_doc2'): " )
    const ret = await sdk.setRules({ 'allow write': true }, "test_doc2")
    console.log("ret: ", ret)
    console.log("add to test_doc2 ")
    const ret2 = await sdk.add({"date_field_1": (new Date()).toString()}, "test_doc2")
    console.log("ret2: ", ret2)

    console.log("sleep 10sec...")
    await sleep(10000)

    console.log("get test_doc")
    console.log('await db.get("test_doc", 10): ', await sdk.get("test_doc", 10))
    console.log("get test_doc2")
    console.log('await db.get("test_doc2", 10): ', await sdk.get("test_doc2", 10))
    console.log("get test_doc3")
    console.log('await db.get("test_doc3", 10): ', await sdk.get("test_doc3", 10))
    process.exit()
}

await main()
