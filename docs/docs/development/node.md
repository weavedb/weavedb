---
sidebar_position: 5
---
# gRPC Node

SmartWeave moves computations off chain onto the client-side for unlimited scalability. But this is not all good news. Even with the lazy execution model, end users need to cache the transactions and compute the current contract states as they need. This makes queries very slow at times.

A gRPC node comes between the WeaveDB contract and browsers and does all the work for thousands of browser clients, so the end-users don't have to do any calculations, let alone holding a shitload of unnecessary cache. Instead it gives back cached data within 1 second for read queries, and processes smart contract transactions within 3 seconds for write queries, which achieves the same UX as most web2 apps.

Browser clients can use the [Light Client](/docs/sdk/client), instead of the full featured SDK wrapping the Warp SDK.

## Set up a Node

### Prerequisites

Install `docker` and `docker-compose` globally to your machine. And open port `8080` for anyone.


### Run docker-compose

Add `weavedb.config.js` to `/node/net/grpc/gateway/weavedb/node-server` directory.

```bash
cd node/net/grpc/gateway/weavedb/node-server
touch weavedb.config.js
```

`weavedb.config.js`

```js
module.exports = {
  name: "weavedb",
  version: "1",
  contractTxId: "xxxxxxxx...",
  arweave: {
    host: "arweave.net",
    port: 443,
    protocol: "https"
  },
  wallet: {
    kty: "RSA",
    n: ...
  }
}

```

Then build and run the docker container.

```bash
cd ..
docker-compose pull prereqs node-server envoy
docker-compose up -d node-server envoy
```

Now you can interact with the node using the [Light Client](/docs/sdk/client).
