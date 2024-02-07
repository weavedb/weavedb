---
sidebar_position: 1
---
# Set up SDK

WeaveDB has 4 types of SDKs.
- a full WeaveDB SDK wrapping the Warp SDK for the web `weavedb-sdk`
- a full SDK for NodeJS `weavedb-sdk-node`
- a Light Client to interact with a remote gRPC node for the web `weavedb-client`
- a Light Client for NodeJS `weavedb-client-node`


The query APIs for both the SDKs are the same.

## Install Full SDK for the Web

```bash
yarn add weavedb-sdk
```

## Install Full SDK for NodeJS

```bash
yarn add weavedb-sdk-node
```
`weavedb-sdk-node` comes with additional methods `on`, `con`, `getCache`, `cgetCache` for pub/sub integration.

## Instantiate WeaveDB

```js
import WeaveDB from "weavedb-sdk" // or "weavedb-sdk-node"

const db = new WeaveDB({ contractTxId: WEAVEDB_CONTRACT_TX_ID })
await db.init()
```

### Optional Parameters

#### common parameters

- **remoteStateSyncEnabled** : `true` | `false` (default : `true`)  
To use [Warp D.R.E.](https://academy.warp.cc/docs/sdk/advanced/evaluation-options#state-auto-sync), set it `true`. D.R.E. works only with `weavedb-sdk` in browser for now.

- **remoteStateSyncSource** : D.R.E. URL (default : `https://dre-3.warp.cc/contract`)  
[D.R.E.](https://academy.warp.cc/docs/dre/overview#nodes) 1, 2, 3, 4, 5, and 6 are available. Use the `https://dre-[NUM].warp.cc/contract` format.

- **network** : `mainnet` | `testnet` | `localhost` (default : `mainnet`)

- **port** : port for localhost  (default : `1820`)

- **arweave** : custom [arweave-js](https://github.com/ArweaveTeam/arweave-js) settings  
e.g. `{host: "arweave.net", port: 443, protocol: "https"}`

- **old** : `true` | `false` (default : `false`)  
WeaveDB contracts v0.7 and less are not compatible with the latest warp SDK. Set this `true` to make it work with old DB instances.

- **nocache** : `true` | `false` (default : `true` for node, `false` for web)  
Set the default `nocache` value. If set `false`, the SDK returns dryWrite result before sending the tx to Warp. dryWrite is performed on virtual state kept by the WeaveDB SDK, or cached state kept by the Warp SDK without making any http requests, so it's just a matter of milliseconds to return the result.

- **wallet** : an admin arweave wallet, note this is different from the [default signing wallet](/docs/sdk/auth#setdefaultwallet)

#### weavedb-sdk-node only parameters

- **subscribe** : `true` | `false` (default : `true`)  
[Warp subscription plugin](https://github.com/warp-contracts/warp-contracts-plugins/tree/main/warp-contracts-plugin-subscription) needed for `on`, `con`, `getCache`, `cgetCache` methods, only available with NodeJS

- **onUpdate** : `function`   
A function to execute on pub/sub updates. `newState` and `input` object will be passed down.

```js
import WeaveDB from "weavedb-sdk-node" 
new WeaveDB({
  contractTxId,
  onUpdate: (newState, query, cache, input)=>{}
})
```

- **cache** : `leveldb` | `lmdb` | `redis` (default : `lmdb`)  
[LMDB has better performance than LevelDB](https://mozilla.github.io/firefox-browser-architecture/text/0017-lmdb-vs-leveldb.html) and also is capable of concurrency, but only available with NodeJS. `leveldb` is what the Warp SDK uses by default, but you can only run one SDK instance with it.

- **lmdb** : lmdb settings to merge with the default settings  

```js
{
  state: { dbLocation: "./cache/warp/state" },
  contracts: { dbLocation: "./cache/warp/contracts" },
  src: { dbLocation: "./cache/warp/src" }
}
````

- **redis** : redis settings  

```js
{
  prefix: "warp", // default to "warp"
  url: "redis://localhost:6379" // default to null
}
```
The Redis cache keys will be

- `[prefix].[contractTxId].state.[sortKey]`
- `[prefix].[contractTxId].contracts.[sortKey]`
- `[prefix].[contractTxId].src.[sortKey]`

## onDryWrite

With `onDryWrite` option, the SDK returns a virtually calculated result before sending the query to Warp.

You can execute `dryRead` queries immediately after `dryWrite` to include in the returnd object.

This is great performance optimization to achieve web2-like speed and UX with the smart contract DB.

```js
const result = await db.set({ name: "Bob" }, "ppl", "Bob", {
  onDryWrite: {
    cache: true,
    cb: async ({ nonce, signer, cache, success, duration, error, func, state, results }) => {
	  console.log(`dryRead results: ${results}`)
	  console.log(`Bob: ${results[0].result}`)
	},
    read: [["get", "ppl"], ["get", "ppl", "Bob"]], // an array of dryRead queries
  },
})
console.log(`regular result: ${result}`)
```

- `cache`: if set `true`, it will be caluculated against the virtual state kept by the WeaveDB SDK, which is much faster (a few ms) than against the Warp SDK dryWrite (a few hundred ms due to checking the latest state with a http request). `false` is still faster than a regular tx execution process (a few seconds). The difference is `true` might return the wrong `dryRead` results if some parallel queries are ongoing on other nodes, which will be solved and roll-backed within 5 seconds.
- `cb`: a callback function to immediately execute upon dryWrite.
- `read`: read queries to immediately execute against the virtual state after dryWrite. The `results` come in the write query return object. This is a great performance optimization compared with separate read queries after a write query.

The code below is equivalent to the above, but it will take 3-5 seconds, where as the above takes only around 50 milliseconds.

```js
const result = await db.set({ name: "Bob" }, "ppl", "Bob")
console.log(`regular result: ${result}`)
const Bob = await db.get("ppl", "Bob", true)
console.log(`this will take 3 - 5 sec: ${Bob}`)
```

### with Light Client

`onDryWrite` can be used with `weavedb-client` / `weavedb-node-client` too. But in that case, there is no `cb` option and the returned value of the entire function will be the result from `dryWrite` execution. This is because the connection to the gRPC node is a one-off gRPC request, which returns a result only once.

After getting a dryWrite result, you can use `getResult()` to fetch the finalized result.

```js
const dryWriteResult = await client.set({ name: "Bob" }, "ppl", "Bob", {
  onDryWrite: {
    cache: true,
    read: [["get", "ppl"], ["get", "ppl", "Bob"]], // an array of dryRead queries
  },
})
console.log(`dryWrite result: ${dryWriteResult}`) // 50-200 ms
console.log(`finalized result: ${await dryWriteResult.getResult()}`) // 3-4 sec
```
