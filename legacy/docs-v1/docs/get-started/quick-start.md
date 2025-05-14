---
sidebar_position: 2
---

# Quick Start 2.0

This is a new tutorial for rollup-based contracts with CL tools.

:::info
WeaveDB rollup is at the very early stage. Please expect bugs, and use it with caution.
:::

## 1. Test Locally

You would want to test everything with your local environment before deploying the DB instance in production.

`weavedb-tools` makes it easiler.

### Install WeaveDB Tools

```bash
sudo npm -g install weavedb-tools
```

Now you can use `weavedb` global command.

### Create a Project

```bash
weavedb create your_project
cd your_project
```

### Write DB Settings

Write DB settings in each file under `db` directory.  
You would need `schemas`, `indexes`, `rules`, `relayers`, `triggers` and `crons` according to your dapp architechtue.

Let's build the simplest dapp where users can post and delete messages.

#### Schemas

You would start with the data schemas. WeaveDB uses JSONSchema.  
We will define only one collection `posts` with `id`, `body`, `owner`, and `date` fields. All the fields are required.

```js title="/db/schemas.js"
module.exports = {
  posts: {
    type: "object",
    required: ["id", "body", "owner", "date"],
    properties: {
      id: { type: "string" },
      description: { type: "string" },
      owner: { type: "string" },
      date: { type: "number" },
    },
  },
}
```
#### Indexes

We want to filter the `posts` by `owner` and sort them by `date` in decending order.

```js title="/db/indexes.js"
module.exports = {
  posts: [
    [["owner"], ["date", "desc"]], // sort by owner, then date
  ],
}
```
#### Access Control Rules

FPJSON 2.0 has made the access control rules drastically simpler, powerful and flexible.  
You can now define custome queries such as `add:post`.  
We will only let users upload `body`, and `id`, `owner` and `date` will be auto generated during the access validation.

```js title="/db/rules.js"
module.exports = {
  posts: [
    [
      "add:post", // define a custom query
      [
        ["fields()", ["*body"]], // only allow "body" field, * makes it mandatory
        [
          "mod()", // auto assign some fields
          {
            id: "$id", // tx id
            owner: "$signer", // tx signer
            date: "$ms", // tx date in millisecond
          },
        ],
        ["allow()"], // allow the query
      ],
    ],
    [
      "delete:post", // define a custom query for deletion
      [ // "=$" will assign the result of the following FPJSON to a variable
        ["=$isOwner", ["equals", "$signer", "$old.owner"]], // check if signer is data owner
        ["allowifall()", ["$isOwner"]], // allow the query if $isOwner is true
      ],
    ],
  ],
}
```

### Test

Write necessary tests in `test/test.js` as you build your DB settings.  
`weavedb-tools` runs WeaveDB offchain, so the tests will be extremely fast.

```js title="/test/test.js"
  it("should execute queries", async () => {
    // add a post
    const tx = await db.query("add:post", { body: "test" }, "posts", userAuth)
    expect(await db.get("posts", tx.docID)).to.eql({
      body: "test",
      id: tx.docID, // auto-assigned
      owner: user.address.toLowerCase(), // auto-assigned
      date: tx.transaction.timestamp, // auto-assigned
    })
    // delete the post by the same user
    await db.query("delete:post", "posts", tx.docID, userAuth)
    expect(await db.get("posts", tx.docID)).to.eql(null)
  })
```

Then run the tests.

```bash
yarn test
```

## 2. Run Rollup Node

:::info
We are preparing Rollup-as-a-Service. But for now, please run your own locally.
:::

Once you have built and thoroughly tested the DB settings, deploy the DB to a local rollup node.

### Generate Test Accounts

You can generate crypto accounts with `yarn keygen`.  
You will need at least 3 EVM accounts for rollup `admin`, DB contract `owner`, and `user`  
and 1 Arweave account for rollup `bundler`.  
Go to your project root directory.

```bash
yarn keygen admin
yarn keygen owner
yarn keygen user
yarn keygen bundler -t ar # for Arweave account
```

The generated accounts are stored under `/.weavedb/accounts`.  
List the accounts.

```bash
yarn accounts
```

You can also import existing accounts in `/weavedb.config.js`.

### Clone WeaveDB Repo

Now get out of the project folder and clone the WeaveDB repo at your preferred place.

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb
```

### Write Configuration

Write a rollup configuration file at `/grpc-node/node-server/weavedb.standalone.config.js`.  
Copy the entire content of `/your_project/.weavedb/accounts/ar/bundler.json`, and `privateKey` from `/your_project/.weavedb/accounts/evm/admin.json`.

```js title="/grpc-node/node-server/weavedb.standalone.config.js"
module.exports = {
  admin: "admin_private_key",
  bundler: { /* Arweave bundler account */ },
  rollups: { }, // this can be empty or pre-defined
}
```

### Run Node

Make sure docker and docker-compose are installed on your machine.  
Then go to the weavedb repo root directory.

```bash
yarn run-rollup
```

Now the rollup node can receive queries at `localhost:8080`.

## 4. Run Explorer

You could simply use our publicly deployed explorer at [scan.weavedb.dev](https://scan.weavedb.dev).

To Run the latest explorer locally, go to the explorer directory at `/weavedb/explorer` in another terminal.

```bash
yarn # install dependencies
yarn dev
```

Now the explorer is running at [localhost:3000](http://localhost:3000).

## 5. Test DB Locally

To deploy your DB to the local rollup node, go back to your project root directory.

```bash
yarn deploy db_name --owner owner
```

Configure the instance with the DB settings.

```bash
yarn setup db_name --owner owner
```

Now your DB is all set!  
You could write some scripts with `weavedb-node-client`, and play around with it.

```js title="/scripts/demo.js"
const SDK = require("weavedb-node-client")
const accounts = require("./lib/accounts")

const main = async key => {
  const userAuth = { privateKey: accounts.evm.user.privateKey }
  const db = new SDK({ rpc: "localhost:8080", contractTxId: "db_name" })
  // add a post
  await db.query("add:post", { body: "test" }, "posts", userAuth)
  // get posts
  console.log(await db.get("posts"))
  // delete a post
  await db.query("add:post", { body: "test" }, "posts", userAuth)
  process.exit()
}

main()
```
Then execute it.

```bash
node scripts/demo.js
```

You could see the transactions in the explorer at [scan.weavedb.dev/node/localhost/db/db_name/txs](http://scan.weavedb.dev/node/localhost/db/db_name/txs).

## 6. Enable Rollup to Arweave / Warp

To enable rollup to the warp sequencer, simply turn on the rollup setting in `weavedb.confg.js`, and redeploy.  

:::info
You cannot change the rollup settings for deployed instances. So you need to deploy a new DB.  
This is because every single transaction should include a signature with L1 contractTxId for L1/L2 verifiability, but non-rollup DBs have transactions without L1 contractTxId.
:::

```js title="/weavedb.config.js"
module.exports = {
  db: {
    app: "http://localhost:3000",
    name: "Demo Dapp",
    rollup: true, // set this true
	plugins: {},
  },
  accounts: { evm: {}, ar: {} },
  defaultNetwork: "localhost",
  networks: {
    localhost: { url: "localhost:8080", admin: "admin" },
  },
}
```
Then redeploy the DB.

```bash
yarn deploy db_name_prod --owner owner
yarn setup db_name_prod --owner owner
```
Now you can see rollup blocks in the explorer at [scan.weavedb.dev/node/localhost/db/db_name_prod/blocks](https://scan.weavedb.dev/node/localhost/db/db_name_prod/blocks).
