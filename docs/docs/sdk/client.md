---
sidebar_position: 2
---
# Light Client

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

The node client only works with ip addresses for now. It also doesn't work with secure ports such as `443`.

To access a remote node, you could set `rpc` field to something like `example.com:8080`.

```js
const WeaveDB = require("weavedb-node-client")

const db = new WeaveDB({
  contractTxId: WEAVEDB_CONTRACT_TX_ID,
  rpc: "0.0.0.0:8080" // gRPC node IP:port
})
```
