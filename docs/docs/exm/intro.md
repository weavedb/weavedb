---
sidebar_position: 1
---
# Getting Started

A quick start for WeaveDB on Execution Machine.

At this point, WeaveDB on EXM is highly experimental and not for production yet.

It requires further optimization on reading data and dividing data collections into multiple functions.

## Deploy

#### Sign up for [EXM](https://exm.dev) to get a token.

#### Clone [the WeaeDB repo](https://github.com/weavedb/weavedb) and run a command.

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb
yarn
```

#### Generate a test account.

```bash
node scripts/generate-wallet.js mainnet
```
A new wallet is stored at `scripts/.wallets/wallet-mainnet.json`

To use an existing Arweave account, place the JWK file at `scripts/.wallets/wallet-mainnet.json`.

#### Deploy a WeaveDB function.

```bash
yarn deploy-exm [YOUR_TOKEN]
```

Take note of the `id` returned by the command. This is your `functionId`.


## SDK for Servers

Due to the nodejs dependencies, `weavedb-exm-sdk` can only be used on the server side.

#### Install

```bash
yarn add weavedb-exm-sdk
```

#### Possible Queries

Read : `get` `cget` `getIndexes` `getSchema` `getRules` `getNonce` `getIds`

Write : `add` `set` `update` `upsert` `delete` `batch` `addIndex` `removeIndex` `setSchema` `setRules`

Refer to [Query APIs section](/docs/sdk/queries).

```javascript
const SDK = require("weavedb-exm-sdk")
const db = new SDK({ token, functionId })
const result = await db.set({ name: "Bob", age: 20 }, "people", "Bob")
```

## Install SDK for the Web

```bash
yarn add weavedb-exm-sdk-web
```

`weavedb-exm-sdk-web` has two usages with/without an `endpoint` specified.

#### With Endpoint (in browser)

If you specify an `endpoint` of an relay server, the sdk will send query transactions to the endpoint.

You would do this because you don't want to reveal your EXM `token` on the client side.

An [Arweave wallet](https://arconnect.io) needs to be passed as `ar` in the last argument of query methods.

```javascript
import SDK from "weavedb-exm-sdk-web"
const functionId = "xxx"

const db = new SDK({ endpoint: "/api/exm", functionId })

const wallet = window.arweaveWallet
await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
await db.set({ name: "Bob", age: 20 }, "people", "Bob", { ar: wallet })
```

#### Without Endpoint (serverless functions)

You can pass your `token` instead of `endpoint`. This should be used on the server-side or with a serverles function.

For example, you could use the `/pages/api` directory of NextJS to relay query transactions.

```javascript
import SDK from "weavedb-exm-sdk-web"

export default async function handler(req, res) {
  const query = JSON.parse(req.body)
  const db = new SDK({
    token: process.env.TOKEN,
    functionId: query.functionId,
  })

  if (query.function === "nonce") {
    res.status(200).json(await db.getNonce(query.address))
  } else if (query.function === "ids") {
    res.status(200).json(await db.getIds(query.tx))
  } else if (
    ["get", "cget", "getIndexes", "getSchema", "getRules"].includes(
      query.function
    )
  ) {
    res.status(200).json(await db[query.function](...query.query))
  } else {
    res.status(200).json(await db.send(query.input))
  }
}
```

## Demo Dapp - The Wall EXM

![](/img/the-wall-exm.png)

Try a simple demo dapp built with Weavedb on EXM at [wall-exm.vercel.app](https://wall-exm.vercel.app/).

You can also run it locally by following [the instructions with the full source code](https://github.com/weavedb/weavedb/tree/master/examples/wall-exm).
