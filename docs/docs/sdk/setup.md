---
sidebar_position: 1
---
# Set up SDK

WeaveDB has two types of SDKs.
- a full WeaveDB SDK wrapping the Warp SDK
- a light client to interact with a remote gRPC node

The query APIs for both the SDKs are the same.

## Install Full SDK

```bash
yarn add weavedb-sdk
```

## Instantiate WeaveDB

```js
import WeaveDB from "weavedb-sdk"

const db = new WeaveDB({
  wallet: ADMIN_ARWEAVE_WALLET_JSON,
  name: "weavedb", // for EIP-712 signature
  version: "1", // for EIP-712 signature
  contractTxId: WEAVEDB_CONTRACT_TX_ID,
  arweave: {
    host: "arweave.net",
    port: 443,
    protocol: "https"
  },
})
```
