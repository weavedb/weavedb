---
sidebar_position: 2
---
# Light Client

With the light client, browser users don't have to hold a full cache from the Warp SDK, which makes read queries extremely fast.

A remote gRPC node must exists for the DB instance and the endpoint URL must be specified as `rpc`.

## Install

```bash
yarn add weavedb-client
```

## Instantiate WeaveDB

```js
import WeaveDB from "weavedb-client"

const db = new WeaveDB({
  name: "weavedb", // for EIP-712 signature
  version: "1", // for EIP-712 signature
  contractTxId: WEAVEDB_CONTRACT_TX_ID,
  rpc: "http://xxx.yyy.zzz.aaa:8080" // gRPC node URL
})
```
