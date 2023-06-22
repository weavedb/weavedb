---
sidebar_position: 2
---

# Get Started

## Deploy database contract

To deploy a WeaveDB database, follow these steps:

1. Go to [console.weavedb.dev](https://console.weavedb.dev/)

2. Click on the Deploy WeaveDB button.

![](https://i.imgur.com/4kzNNZr.png)

3. Connect your wallet by clicking on Connect Owner Wallet. This wallet will serve as the admin account for configuring your database.

![](https://i.imgur.com/dSZfEQ1.png)

4. Set `Secure` to `False` for the purposes of this tutorial. (Note: In a production setting, you should never set `Secure` to `False`.)

5. Finally, click on `Deploy DB Instance`. Your WeaveDB database will be deployed to the mainnet in just a few seconds. You can view the transaction for the deployment by clicking on the `contractTxId` link.

![](https://i.imgur.com/vL4d75W.png)

## Create a new collection

Using the [web console](https://console.weavedb.dev/), click `Data Collections` in the side menu, and then click the `+` icon in the `Collection` box to open up a dialog. After putting the name of your collection in the "Collection ID" input field, click "Add".

For this example, we will set `people` as our collection name.

## Install weavedb

### weavedb-sdk for Web

```bash
yarn add weavedb-sdk
```

### weavedb-sdk-node for NodeJS

```bash
yarn add weavedb-sdk-node
```
`weavedb-sdk-node` comes with additional methods `on`, `con`, `getCache`, `cgetCache` for pub/sub integration.

## Initialize WeaveDB
```js
import WeaveDB from "weavedb-sdk" // or "weavedb-sdk-node"

const db = new WeaveDB({ contractTxId: YOUR_WEAVEDB_CONTRACT_TX_ID })
await db.init()
```

## Add document to a collection

```js
const personData = { name: "Bob", age: Number(20) }
const result = await db.add(personData, "your_collection_name")
```

## Get a collection

`get` only returns data, whereas `cget` returns metadata of the documents too.

```js
const result = await db.get("your_collection_name")
```

```js
const result = await db.cget("collection_name")
```


