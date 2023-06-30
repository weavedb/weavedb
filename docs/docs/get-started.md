---
sidebar_position: 2
---

# Get Started

## Deploy Database

Using the [web console](https://console.weavedb.dev/), follow the instructions on [Deploy Database](/docs/web-console/deploy-contract)

## Create Collection

Using the [web console](https://console.weavedb.dev/), follow the instructions on [Create Collection](/docs/web-console/create-collection)

## Install WeaveDB

### SDK for Web

```bash
yarn add weavedb-sdk
```

### SDK for NodeJS

```bash
yarn add weavedb-sdk-node
```

## Initialize WeaveDB
```js
import WeaveDB from "weavedb-sdk" // or "weavedb-sdk-node"

const db = new WeaveDB({ contractTxId: YOUR_WEAVEDB_CONTRACT_TX_ID })
await db.init()
```

## Add Document

```js
const personData = { name: "Bob", age: 20 }
const result = await db.add(personData, "your_collection_name")
```

## Get Collection

`get` only returns data, whereas `cget` returns metadata of the documents too.

```js
const result = await db.get("your_collection_name")
```

```js
const result = await db.cget("collection_name")
```

:::note
Replace `contractTxId` string value with the `contractTxId` when deploying your database.

Replace `your_collection_name` string value with the name of your collection.
:::