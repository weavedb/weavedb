---
sidebar_position: 1
---
# Rollup Node

![](/img/rollup.png)

## How Rollup Works

- A rollup node can have multiple DB instances.
- The admin user can add/update/remove DB instances.
- Once a DB is added, the gateway node dispatches rollup child process which contains an L2 DB, a WAL DB, and plugins DBs. All these DBs are offchain WeaveDB instances.
- If an L1 DB contract is deployed and rollup is enabled, the rollup process dispatches yet another child process for Warp SDK that keeps bundling L2 transactions and roll them up to the Warp sequencer in parallel.
- The L1 WeaveDB contract can receive bundle transactions in parallel in any order, but can resolve the correct order and compute the exact same state as the corresponding L2 contract. L2 transaction hashes are chaind in such a way that L1 contract can resolve L2 transaction order.
- When the WeaveDB Gateway receives an L2 query, it dispatches the query to the L2 DB on the rollup process, which triggers a WAL DB query, which in turn triggers offchain plugin DB queries.
- If the rollup node started without any local cache, it can recover the L2 DB state from the corresponding L1 contract.
- Users can query the DB directly on the L1 Warp contract, since L2 and L1 share the identical contract. The L1 delay is only a few seconds as the rollup flow takes less than 2 seconds.

## Set up a Node

### Prerequisites

Install `docker` and `docker-compose` globally to your machine. And open port `8080` for anyone.

### weavedb.standalone.config.js

Create `weavedb.standalone.config.js` in `/grpc-node/node-server` directory.  

#### The minimum requirements

- `admin` : an EVM private key for rollup node admin. The admin can add DBs to the node.
- `bundler` : Arweave RSA keys for rollup bundler.  
The bundler will pay for rollup transactions and receive rewards from PoS in the future.
- `rollups` : this can be either empty or filled with pre-defined DB instances. Each key is the database name.
  - `secure` : passed down to the contract initial-state, allways use `true` in production (default).
  - `owner` : the DB contract owner EVM address.
  - `tick` : time span in millisecond in which [tick](/docs/sdk/crons#tick) query will be periodically executed.
  - `contractTxId` : Warp L1 contractTxId.
  - `plugins` : add offchain plugins, plugin scripts have to be placed in `/grpc-node/node-server/plugins` with the same name.
  - `rollup` : a bloolean value to enable rollup to Arweave/Warp

```js title="/grpc-node/node-server/weavedb.standalone.config.js"
module.exports = {
  admin: EVM_PRIVATE_KEY,
  bundler: ARWEAVE_RSA_KEYS,
  rollups: {},
}
```

#### Other Parameters

- `dir` : cache dirctory, default to `/grpc-node/node-server/cache`.
- `dbname` : cache database name, cache will be stored in `dir/dbname`.
- `nostr` : enable WebSocket for Nostr, this turns the node into a Nostr relay.
  - `db` : the database name for Nostr events, there can be only one DB instance to receive Nostr events.


With everything included,

```js title="/grpc-node/node-server/weavedb.standalone.config.js"
module.exports = {
  dir: "/home/xyz/cache",
  dbname: "mydb",
  admin: "privateky...",
  bundler: {
    kty: "RSA",
	...
  },
  nostr: { db: "nostr" },
  rollups: {
    testdb: {
	  secure: true,
	  owner: "0xdef...",
	  tick: 1000 * 60 * 5,
	  contractTxId: "abcdef...",
	  rollup: true,
	  plugins: { notifications: {} },
	},
	nostr: {
	  owner: "0xdef...",
	  rollup: false,
	}
  },
}
```

#### Auto Recovery

If `contractTxId` is specified and the rollup node is re-initialized without cache, it will auto-recover the rollup DB state from Warp L1 transaction history.

### Run docker-compose

```bash
yarn run-rollup
```
### Admin Operations

Anyone can access the rollup node stats, which returns the deployed DB information.

```js
const DB = require("weavedb-node-client")
const db = new DB({ rpc: "localhost:8080", contractTxId: "testdb" })
const stats = await db.node({op: "stats"})
```

The admin EOA account can manage the rollup node and DBs from anywhere.

#### Add DB

```js
const tx = await db.admin(
  {
    op: "add_db",
    key: "testdb2",
    db: {
      app: "http://localhost:3000", // this will be shown on the explorer
      name: "Jots", // this will be shown on the explorer
      rollup: false,
      plugins: { notifications: {} },
      tick: 1000 * 60 * 5,
    },
  },
  { privateKey: admin.privateKey }
)
```
#### Deploy Warp L1 Contract

```js
const { contractTxId, srcTxId } = await db.admin(
  { op: "deploy_contract", key: "testdb2" },
  { privateKey: admin.privateKey }
)
// you will need the "contractTxId" for regular DB queries
```

#### Update DB

```js
const tx = await db.admin(
  { op: "deploy_contract", key: "testdb2" },
  { privateKey: admin.privateKey }
)
```

#### Remove DB

```js
const tx = await db.admin(
  { op: "remove_db", key: "testdb2" },
  { privateKey: admin.privateKey }
)
```


#### Query DB

You will need the L1 `contractTxId` from the deployment operation to instantiate the DB client.  
All L2 transactions will be signed with L1 `contractTxId` for L1/L2 verifiability.

```js
const DB = require("weavedb-node-client")
const db = new DB({ rpc: "localhost:8080", contractTxId })
const db_info = await db.getInfo()
```

### Plugins

We currently have only one plugin for [Jots](/docs/get-started/jots#write-db-configurations) called `notifications` which generates personal notifications from onchain Jots activities. The notification DB will be an offchain WeaveDB instance, which won't be recorded onchain. Not every data should be onchain, and offchain plugins solve the problem. WeaveDB can seamlessly run in multiple environment such as blockchain, offchain (local), browser and centralized cloud.

### Explorer

If you are running the rollup node on `localhost:8080`, you can view blocks and transactions on our public [WeaveDB Scan](https://scan.weavedb.dev/node/localhost).
