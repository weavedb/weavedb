---
sidebar_position: 1
---
# Set up SDK

## Install

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
