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

