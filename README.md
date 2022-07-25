# WeaveDB

![](./assets/cover.png)

## Overview

### What is WeaveDB?

WeaveDB is a NoSQL database powered by SmartWeave on the Arweave blockchain.

The APIs are a subset (will be a superset) of Firestore from Google but completely decentralized.

- Data is stored on the Arweave permanent storage where anyone can access without permission.
- User authentication (WeaveAuth) is done by pure cryptography using crypto wallets such as MetaMask and ArConnect.
- SmartWeave makes it possible to apply complex computation to stored data for web-centric large-scale dapps just like web2 apps.

### Crypto Account Authentication

Authentication is done by WeaveAuth, which cryptographically authenticates EVM-based accounts with EIP-712 signatures on SmartWeave contracts.

Other types of crypto accounts will be supported in the future such as Arweave and Polkadot.

The current access control model is rather primitive where only the original creator of a document can conduct write operations to the document. A full set of granular access contols will be implemented soon.

### Demo



The v0.2 contract is deployed on the Warp mainnet at [Ndw5zrbokHM4uFWaEVRQwPYr6PwLme16O4cnxZ0pgV4](https://sonar.warp.cc/?#/app/contract/Ndw5zrbokHM4uFWaEVRQwPYr6PwLme16O4cnxZ0pgV4)

A v0.2 demo dapp (Social Bookmarking) is deployed at [asteroid.ac](https://asteroid.ac).

The v0.1 contract is deployed on the Warp testnet at [ltj7QZSNIKbklMmP2b4ypbuUZoN77EQkjFR4Wid2ZIE](https://sonar.warp.cc/?#/app/contract/ltj7QZSNIKbklMmP2b4ypbuUZoN77EQkjFR4Wid2ZIE?network=testnet#).

A v0.1 demo dapp (Todo App) is deployed at [weavedb.asteroid.ac](https://weavedb.asteroid.ac).

## Development

### Clone the Repo

[WeaveDB](https://github.com/asteroid-dao/weavedb) is a monorepo that consists of Warp contracts, SDK, REPL, a web console, and many helper scripts.

```bash
git clone https://github.com/asteroid-dao/weavedb.git
cd weavedb
yarn
```

Test.

```bash
yarn test
```

### Run local instance and REPL

Run ArLocal and WeaveDB at `http://localhost:1820`.

```bash
yarn repl
```

### Run Web Console

Start the web console at [http://localhost:3000](http://localhost:3000).

```bash
cd console
yarn
yarn dev
```

### Deploy Your Own WeaveDB Contracts

Deploy on the Warp mainnet.

```bash
node scripts/generate-wallet.js mainnet
yarn deploy
```
or on the testnet

```bash
node scripts/generate-wallet.js testnet
node scripts/add-funds.js testnet
yarn deploy-testnet
```

In the client app, you will need to install `buffer` package and expose it to `window.Buffer` to resolve the Buffer dependency for crypto authentications. This will be removed in future releases.

```bash
yarn add buffer
```

Do the following somehow according to the web framework of your choice.
```js
import { Buffer } from "buffer"
window.Buffer = Buffer
```

## WeaveDB SDK

### Install

```bash
yarn add weave-sdk
```

### Instantiate WeaveDB

```js
import WeaveDB from "weavedb-sdk"

const db = new WeaveDB({
  web3: web3, // only for browser environments
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

## Query APIs

WeaveDB is currently a subset of Firestore. So WeaveDB can do most of the things Firestore can do, but with syntactic sugar inspired by [Firestore Sweet](https://warashibe.github.io/firestore-sweet/).

### get / cget

`get` only returns data, whereas `cget` returns metadata of the docs too.

```js
{ id, setter, data, block: { height, timestamp } }
```

The metadata returned with `cget` functions as a cursor for pagination.

Get a doc

```js
await db.get("collection_name", "doc_id")
await db.cget("collection_name", "doc_id")
```

Get a collection

```js
await db.get("collection_name")
await db.cget("collection_name")
```
Arbitrary length of document nesting is possible.

```js
await db.get("collection_name", "doc_id", "sub_collection_name_1", "sub_doc_id_1", "sub_collection_name_2", "sub_doc_id_2")
```

Limit the number of docs

```js
await db.get("collection_name", 5)
```

Sort

```js
await db.get("collection_name", [ "age" ])
await db.get("collection_name", [ "age", "desc" ])
await db.get("collection_name", [ "age", "desc" ], [ "name", "asc" ])
```

Where

```js
await db.get("collection_name", ["age"], [ "age", ">", 20 ])
```

`=` `>` `>=` `<` `<=` `!=` `in` `not-in` `array-contains` `array-contains-any` are supported.

Skip

```js
await db.get("collection_name", [ "age" ], [ "startAfter", 20 ], [ "endAt", 60 ])
await db.get("collection_name", [ "age" ], [ "name", "desc" ], [ "startAfter", 20, "Bob" ])
```

`startAt` `startAfter` `endAt` `endAfter` are supported.

Pagination

```js
const docs_page1 = db.cget("collection_name", [ "age" ])
const docs_page2 = db.cget("collection_name", [ "age" ], ["startAfter", docs_page1[docs_page1.length - 1]])
```

### set

Set a doc

```js
await db.set({ "age": 20, "name": "Bob" }, "collection_name", "doc_id")
```
### upsert

Upsert a doc

```js
await db.upsert({ "age": 20, "name": "Bob" }, "collection_name", "doc_id")
```

### update

Update a doc

```js
await db.update({ "age": 25 }, "collection_name", "doc_id")
```
Delete a field

```js
await db.update({ "age": db.del() }, "collection_name", "doc_id")
```

Increase/Decrease a field

```js
await db.update({ "age": db.inc(5) }, "collection_name", "doc_id")
await db.update({ "age": db.inc(-5) }, "collection_name", "doc_id")
```

Array union

```js
await db.update({ "chars": db.union([ "a", "b", "c", "d" ]) }, "collection_name", "doc_id")
```

Array remove

```js
await db.update({ "chars": db.union([ "b", "c" ]) }, "collection_name", "doc_id")
```

Set block timestamp
```js
await db.update({ "date": db.ts() }, "collection_name", "doc_id")
```

Set signer Ethereum address
```js
await db.update({ "address": db.signer() }, "collection_name", "doc_id")
```

### delete

Delete a doc

```js
await db.delete("collection_name", "doc_id")
```

## Data Schemas

It's essential to set a presice data schema and access controls to each collection as otherwise WeaveDB is permissionless and anyone can put arbitrary data.

To validate write data, WeaveDB uses [@exodus/schemasafe](https://github.com/ExodusMovement/schemasafe) with a restriction that you cannot pass valiator functions.

Set a schema to a collection

```js
const schema = {
  type: "object",
  required: ["article_id", "date", "user_address"],
  properties: {
    article_id: {
      type: "string",
    },
    user_address: {
      type: "string",
    },
    date: {
      type: "number",
    },
  },
}
await db.setSchema(schema, "bookmarks")
```

Get the schema of a collection

```js
await db.getSchema(schema, "bookmarks")
```

Remove a schema from a collection

```js
await db.removeSchema(schema, "bookmarks")
```

## Access Control Rules

Access Control Rules are as important as the schemas for decentralized database. WeaveDB rules are extremely powerful using [JsonLogic](https://jsonlogic.com/) with an original add-on that enables JSON-based [ramda](https://ramdajs.com/) functional programming.

Add rules

```js
const rules = {
  let: {
    id: [
      "join",
      ":",
      [
        { var: "resource.newData.article_id" },
        { var: "resource.newData.user_address" },
      ],
    ],
  },
  "allow create": {
    and: [
      { "!=": [{ var: "request.auth.signer" }, null] },
      {
        "==": [{ var: "resource.id" }, { var: "id" }],
      },
      {
        "==": [
          { var: "request.auth.signer" },
          { var: "resource.newData.user_address" },
        ],
      },
      {
        "==": [
          { var: "request.block.timestamp" },
          { var: "resource.newData.date" },
        ],
      },
    ],
  },
  "allow delete": {
    "!=": [
      { var: "request.auth.signer" },
      { var: "resource.newData.user_address" },
    ],
  },
}
await db.setRules(rules, "bookmarks")
```
Within the rules object, each top level key defines one rule. A keys should be a combination of (`allow` or `deny`) and (`write`, `create`, `update`, `delete`).

`allow write` is equivalent to `allow create, update, delete`.

You can access to various data within the validation blocks.

```js
const data = {
  request: {
    auth: { signer },
    block: { height, timestamp },
    transaction: { id },
    resource: { data },
    id,
    path,
  },
  resource: { data, setter, newData, id, path },
}
```

### Add-on: JSON-based Functional Programming
Javascript functions cannot be passed and stored with Warp contracts. So WeaveDB invented a powerful & simple way to do functional programming using JSON objects. You can use most of the [ramda](https://ramdajs.com) functions, which enables highly complex logics for access controls and data validations.

Within the rules object, you can define variables under `let` key and later use them within `allow/deny` validation blocks.


```js
const rules = {
  let: {
    id: [
      "join",
      ":",
      [
        { var: "resource.newData.article_id" },
        { var: "resource.newData.user_address" },
      ],
    ],
  },
  ...
}
```
For example, above is equivalent to

```js
const id = join(":", [ resource.newData.article_id, resource.newData.user_address ])
```
and later forcing doc ids to be `article_id:user_address` with JsonLogic.

```js
{
  "==": [{ var: "resource.id" }, { var: "id" }],
}
```
## Indexes

Single field indexes are automatically generated, but multi field compound indexes need to be added by the DB admin before collections can be accessed with complex queries.

add an index

```javascript
await db.addIndex([ [ "age" ], [ "height", "desc" ] ], "people")
```

get indexes of a collection

```javascript
await db.getIndexes("people")
```

remove an index

```javascript
await db.removeIndex([ [ "age" ], [ "height", "desc" ] ], "people")
```

## Authentication

When writing to the DB, Ethereum-based addresses are authenticated with [EIP-712](https://eips.ethereum.org/EIPS/eip-712) signatures. However, this requires dapp users to sign with Metamask for every action, and it's a very poor UX. To solve this, WeaveDB allows internal address linking, so dapp users can use disposal addresses for auto-signing.

Users will generate a disposal address by signing with Metamask when logging in to the dapp.

The disposal address will be verified and linked to the original metamask address within the WeaveDB contract.

The private key of the disposal address can be stored in a secure space on the client side such as [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

The dapp can auto-sign write transactions with the disposal private key instead of asking users to sign with Metamask for every action.

The transactions signed by the disposal private key will act as the original metamask address within the WeaveDB.

You can revoke the address link anytime and forget about the disposal address.

This will create a great UX for dapps where users only sign once for address linking (this is also instant) and dapp transactions are free, instant and automatic all thanks to [Bundlr](https://bundlr.network/) used underneath.

### Temporary Address for Auto-signing

Create a temporary address. Dapps would do this only once when users sign in.

```js
const { identity } = db.createTempAddress(METAMASK_ADDRESS)
```

Dapps can store the `identity` in the IndexedDB and auto-sign when the user creates transactions.

Query DB with the temporary address

```js
await db.add(
  { name: "Bob", age: 20 },
  "people",
  {
    wallet: METAMASK_ADDRESS,
    addr: identity.address,
    privateKey: identity.privateKey,
  }
)
```

Remove an address link

```js
await db.removeAddressLink({ address: identity.address })
```

## Further References

You can learn everything about Arweave/SmartWeave/Warp at [Warp Academy](https://academy.warp.cc/).
