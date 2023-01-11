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

const db = new WeaveDB({
  wallet: ADMIN_ARWEAVE_WALLET_JSON,
  contractTxId: WEAVEDB_CONTRACT_TX_ID
})

// In case the wallet is not set, you can run initializeWithoutWallet() after the instantiation.
await db.initializeWithoutWallet()

// Or you can assign the wallet later. Note initialize() is not an async-function.
db.initialize({
  wallet: ADMIN_ARWEAVE_WALLET_JSON
})
```

### Optional Parameters

#### common parameters

- **network** : `mainnet` | `testnet` | `localhost` (default : `mainnet`)

- **port** : port for localhost  (default : `1820`)

- **arweave** : custom [arweave-js](https://github.com/ArweaveTeam/arweave-js) settings  
e.g. `{host: "arweave.net", port: 443, protocol: "https"}`

- **old** : `true` | `false` (default : `false`)  
WeaveDB contracts v0.7 and less are not compatible with the latest warp SDK. Set this `true` to make it work with old DB instances.

#### weavedb-sdk-node only parameters

- **subscribe** : `true` | `false` (default : `true`)  
[Warp subscription plugin](https://github.com/warp-contracts/warp-contracts-plugins/tree/main/warp-contracts-plugin-subscription) needed for `on`, `con`, `getCache`, `cgetCache` methods, only available with NodeJS

- **cache** : `leveldb` | `lmdb` (default : `leveldb`)  
[LMDB has better performance than LevelDB](https://mozilla.github.io/firefox-browser-architecture/text/0017-lmdb-vs-leveldb.html) and also is capable of concurrency, but only available with NodeJS

- **lmdb** : lmdb settings to merge with the default settings  
e.g. `{state: {dbLocation: "xyz"}, contracts: {dbLocation: "xyz2"}}`

