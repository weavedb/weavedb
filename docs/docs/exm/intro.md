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

An [Arweave wallet](https://arconnect.io) needs to be passed as `ar` in the last argument of query methods.

```javascript
import SDK from "weavedb-exm-sdk-web"
const functionId = "xxx"

const db = new SDK({ functionId })

const wallet = window.arweaveWallet
await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
await db.set({ name: "Bob", age: 20 }, "people", "Bob", { ar: wallet })
```

## Demo Dapp - The Wall EXM

![](/img/the-wall-exm.png)

Try a simple demo dapp built with Weavedb on EXM at [wall-exm.vercel.app](https://wall-exm.vercel.app/).

You can also run it locally by following [the instructions with the full source code](https://github.com/weavedb/weavedb/tree/master/examples/wall-exm).
