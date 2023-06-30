---
sidebar_position: 2
---

# Get Started

## Deploy a Database

Using the [web console](https://console.weavedb.dev/), follow the instructions on [Deploying a Database](/docs/web-console/deploy-contract)

## Create a Collection

Using the [web console](https://console.weavedb.dev/), follow the instructions on [Creating a Collection](/docs/web-console/create-collection)

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

## Add a document

```js
const personData = { name: "Bob", age: 20 }
const result = await db.add(personData, "your_collection_name")
```

## Get a collection

Use `get` to read a collection:

```js
const result = await db.get("your_collection_name")
```

And `cget` to return the metadata of the documents too:

```js
const result = await db.cget("collection_name")
```