---
sidebar_position: 1
---
# Rollup Node

Browser clients can use the [Light Client](/docs/advanced/client), instead of the full featured SDK wrapping the Warp SDK.

## Set up a Node

### Prerequisites

Install `docker` and `docker-compose` globally to your machine. And open port `8080` for anyone.

### weavedb.standalone.config.js

Add `weavedb.standalone.config.js` to `/grpc-node/node-server` directory.


```js
module.exports = {
  // dir: CACHE_DIRNAME,
  dbname: DBNAME,
  secure: true,
  owner: OWNER_EVM_ADDRESS,
  admin: EVM_PRIVATE_KEY,
  rollups: {
    offchain: { plugins: { notifications: {} }, tick: 1000 * 60 * 5 },
  },
}
```
:::danger
Rollup to Warp is temporarily disabled as it doesn't scale at the moment.  
We will provide multiple options to roll up with some trade-offs.
:::


- `dir` : cache dirctory, default to `/grpc-node/node-server/cache`
- `dbname` : database name, cache will be stored in `dir/dbname`
- `secure` : passed down to the contract initial-state, allways use `true` in production
- `owner` : the DB contract owner EVM address
- `admin` : the rollup admin evm private key, this might be changed to Arweave RSA keys in the future.
- `rollups` : set up initial rollup DB instances, you can add DB instances later on too. Each key will be an L1 contractTxID, but for now rollup is disabled and you can use any names.
  - `dir`, `dbname`, `secure`, `owner` will be inherited from above, unless they are specified in each `rollups` instance again.
  - `tick` : seconds to periodically execute `tick` query, if you need `crons`, tick will keep updating the state with cron results
  - `plugins` : add offchain plugins, plugin scripts have to be placed in `/grpc-node/node-server/plugins` with the same name.

### Run docker-compose

```bash
yarn run-rollup
```

Now you can interact with the node using the [Light Client](/docs/advanced/client).

## Deploy on Local Machine

Deploying a WeaveDB node on your local machine is much easier than on a cloud service.

##### 1. Clone the WeaveDB monorepo

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb
yarn
```

##### 2. Create a configuration file at `/node/net/grpc/gateway/weavedb/node-server/weavedb.standalone.config.js`.

##### 3. Install Docker and Docker Compose according to your environment

##### 4. Run Docker Compose

```bash
yarn run-node
# cd grpc-node && sudo docker-compose -f docker-compose-standalone.yml up --build
```

##### 5. Set the instance IP address to the Light Client

- Create an Next.js app and install `weavedb-client`

```bash
npx create-next-app@latest test-node
cd test-node
yarn add weavedb-client
yarn dev
```

In case of using our public demo contract, you should be able to fetch wall comments like below.

`/page/index.js`

```javascript
import { useEffect, useState } from "react"
import client from "weavedb-client"

export default function Home() {
  const [ok, setOK] = useState(false)
  useEffect(() => {
    ;(async () => {
      const db = new client({
        contractTxId: "offchain",
        rpc: "http://localhost:8080",
      })
      setOK((await db.get("wall", 1)).length > 0)
    })()
  }, [])
  return <div>{ok ? "ok" : "not ok"}</div>
}
```
