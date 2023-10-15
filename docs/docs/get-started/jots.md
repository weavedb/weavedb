---
sidebar_position: 3
---

# Jots

[Jots](https://jots.social) is the first fully social dapp built with WeaveDB.  
The entire codebase is [opensource](https://github.com/weavedb/weavedb/tree/master/examples/jots), and you can run it yourself.  
To follow this tutorial, you should be familier with the development flow on the [quick start](/docs/get-started/quick-start) guide.

## Prerequisites

- A local rollup node is running

## Deploy

### Clone WeaveDB Repo

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb/examples/jots/db
yarn
```

### Generate Accounts

```bash
yarn keygen owner
yarn keygen relayer
```

### Write DB Configurations

The admin account must be the same as the rollup admin. Copy the `privateKey` from `/.weavedb/accounts/evm/admin.js` under your rollup directory in [the previous tutorial](/docs/get-started/quick-start#generate-test-accounts).

```js title="/weavedb.config.js"
module.exports = {
  db: {
    app: "http://localhost:3000",
    name: "Jots",
    rollup: false, // keep it off for local tests
    plugins: { notifications: {} }, // Jots uses notifications plugin
  },
  accounts: {
    evm: {
      admin: { privateKey: "0x" }, // copy the admin privateKey from the previous tutorial
    },
    ar: {},
  },
  defaultNetwork: "localhost",
  networks: {
    localhost: { url: "localhost:8080", admin: "admin" },
  },
}
```

### Deploy DBs

```bash
yarn deploy jots --owner owner
yarn setup jots --owner owner --relayer relayer
yarn setup jots --owner owner --plugin notifications # set up plugin DB
```

### Initialize Jots Dapp

The following script invites the first user to the app and grants 100 invites.
```bash
node scripts/initJots.js jots --owner owner --user 0xUser_Address
```

### Deploy Frontend

Now go to the `app` directory.

```bash
cd ../app
yarn
```

Set up environmental variables in `.env.local`.

Currently, Jots is using Google Cloud Storage (GCS) to store media files. The GCS settings can be copied from a service-account-json file you can generate on the [Firebase Console](https://console.firebase.google.com).
We will replace this with [Irys (Bundler)](https://irys.xyz/) in the future.  
Copy the relayer's privateKey from the previous step.

```js title="/.env.local"
NEXT_PUBLIC_RPC="http://localhost:8080"
RPC="0.0.0.0:8080"
NEXT_PUBLIC_TXID="jots"
RELAYER_PRIVATE_KEY="relayer_private_key"

GCS_BUCKET="project_id.appspot.com"
GCS_PROJECT_ID="project_id"
GCS_EMAIL="firebase-adminsdk-xyz@project_id.iam.gserviceaccount.com"
GCS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
Note that if the rollup mode is on, `NEXT_PUBLIC_TXID` should be the `contractTxId`.

```bash
yarn dev
```
Now Jots are running at [localhost:3000](http://localhost:3000).

You could see blocks and transactions in the explorer at [scan.weavedb.dev/node/localhost/db/jots](https://scan.weavedb.dev/node/localhost/db/jots).

