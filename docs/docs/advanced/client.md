---
sidebar_position: 2
---
# Light Client

:::danger
Light Client is not up to date with the latest contract versions. Please try the [local SDK](/docs/sdk/setup) for now.  
We are currently developing a managed node service so you won't need to set up your own node.  
The managed node service will be decentralized in the future.
:::

With the light client, browser users don't have to hold a full cache from the Warp SDK, which makes read queries extremely fast.

A remote gRPC node must exists for the DB instance and the endpoint URL must be specified as `rpc`.

## For Web Browsers

### Install

```bash
yarn add weavedb-client
```

### Instantiate WeaveDB

```js
import WeaveDB from "weavedb-client"

const db = new WeaveDB({
  contractTxId: WEAVEDB_CONTRACT_TX_ID,
  rpc: "http://xxx.yyy.zzz.aaa:8080" // gRPC node URL
})
```

## For NodeJS

### Install

```bash
yarn add weavedb-node-client
```

### Instantiate WeaveDB

To access a remote node, you could set `rpc` field to something like `example.com:8080`.

```js
const WeaveDB = require("weavedb-node-client")

const db = new WeaveDB({
  contractTxId: WEAVEDB_CONTRACT_TX_ID,
  rpc: "0.0.0.0:8080" // gRPC node IP:port
})
```

It also works with remote secure ports such as `example.com:443`.

```js
const WeaveDB = require("weavedb-node-client")

const db = new WeaveDB({
  contractTxId: WEAVEDB_CONTRACT_TX_ID,
  rpc: "example.com:443"
})
```

or


```js
const WeaveDB = require("weavedb-node-client")

const db = new WeaveDB({
  contractTxId: WEAVEDB_CONTRACT_TX_ID,
  rpc: "example.com",
  secure: true, // optional
  cert: YOUR_CERT // optional
})
```
