---
sidebar_position: 2
---

# Quick Start

## Introduction

### What is WeaveDB?

Decentralized NoSQL(document-based) Database as a smart contract on [Arweave](https://www.arweave.org/).

It's fully decentralized [Firestore](https://firebase.google.com/docs/firestore) for web3 that provides features such as

- cross-chain authentication
- comparable performance with web2 alternatives
- virtually unlimited scalability
- cross-chain data composability via [Lit Protocol](https://litprotocol.com/)
- encryption for private data
- large data uploading via [Bundlr](https://bundlr.network/)
- cron jobs without transactions
- on-chain indexing
- web2-like smooth UX for dapp users
- native integration with social protocol such as [Lens Protocol](https://www.lens.xyz/)

and many more.

### Database Structure

A WeaveDB instance has collections, each collection has docs, and each doc has data fields and sub-collections.

![](https://i.imgur.com/aiLhOha.png)

For example, let's define a collection called `people` and it could contain 3 docs as following.

```bash
- people
  |
  |- Bob
  |  |
  |  |- name: "Bob"
  |  |- age: 20
  |
  |- Alice
  |  |
  |  |- name: "Alice"
  |  |- age: 30
  |
  |- Mike
     |
     |- name: "Mike"
     |- age: 40
```


## Basic

### Deploy Contract

Go to [console.weavedb.dev](https://console.weavedb.dev).

Click `Deploy WeaveDB`.

![](https://i.imgur.com/4kzNNZr.png)

Clik `Connect Owner Wallet` and connect your wallet. This will be the admin account to configure the DB.

![](https://i.imgur.com/dSZfEQ1.png)

Set `Secure` to `False` for this tutorial (never do that for production dapps).

Finally, `Deploy DB Instance`. Your DB will be deployed to mainnet in a few seconds. You can view the transaction for the deployment via the `contractTxId` link.

![](https://i.imgur.com/vL4d75W.png)

### Play Around with Basic Queries

WeaveDB has [the same queries as Firestore](https://firebase.google.com/docs/firestore/query-data/get-data) and more, but the syntax is simplified.

For example, this is an example query with Firestore.

```javascript
(await firestore.collection("people").doc("Bob").get()).data()
```

It's simplified with WeaveDB SDK,

```javascript
await db.get("people", "Bob")
```

and even shorter in WeaveDB terminal.

```bash
get people Bob
```

:::info
The reason for this simplified syntax is it can be expressed as a simple JSON array (e.g.`["get", "people", "Bob"]`) and stored as a smart contract state and composed with other snippets. This is the key to the WeaveDB's advanced logic building using [FPJSON](https://fpjson.weavedb.dev), which is out of the scope of this tutorial.
:::

To play around with queries, `Sign Into DB` with your owner wallet first.

![](https://i.imgur.com/UDaASKa.png)

You can type and execute arbitrary queries in the bottom terminal.

![](https://i.imgur.com/N0K8st0.png)

:::caution
When using the bottom terminal, try not to insert spaces in objects. Spaces are used to separate arguments so it will be parsed incorrectly, or wrap the object with `'` or `"`.

This is wrong as there is a space after `{name:`.

> set {name: "Bob"} people Bob

These are correct.
> set '{name: "Bob"}' people Bob

> set {name:"Bob"} people Bob
:::

#### getInfo

To get general information about the instance.

```bash
getInfo
```

#### add : data_JSON : collection_name

To add a doc to a collection. The doc id will be auto-generated.

```bash
add {name:"Bob",age:20} people
```

#### set : data_JSON : collection_name : doc_name

To set a doc.

```bash
set {name:"Bob",age:20} people Bob
```

#### update : data_JSON : collection_name : doc_name

To update a doc.

```bash
update {age:30} people Bob
```
#### delete : collection_name : doc_name

To delete a doc.

```bash
delete people Bob
```

#### upsert : data_JSON : collection_name : doc_name

To upsert a doc.

```bash
upsert {name:"Bob",age:20} people Bob
```

The defferences between `set`, `upsert`, `update` are

- `set` will reset the whole doc if the doc already exists.
- `update` will fail if the doc exists.
- `upsert` works like `update` but will merge if the doc already exists.

Let's say there exists no doc at `peopoe` -> `Bob`.

```bash
update {name:"Bob",age:20}
# this willl fail

upsert {name:"Bob",age:20}
# {name: "Bob", age: 20}

set {name:"Bob",age:20}
# {name: "Bob", age: 20}
```

Let's say we have `{name: "Bob", age: 20}` at `peopoe` -> `Bob`.

```bash
update {age:25}
# {name: "Bob", age: 25}

upsert {age:25}
# {name: "Bob", age: 25}

set {age:25}
# {age: 25}
```

#### get

Let's add some people for the following tutorial.

```bash
set {name:"Bob",age:20} people Bob
set {name: "Alice", age:30} people Alice
set {name:"Mike",age:40} people Mike
```

To get a single doc.

```bash
get people Bob 
```

To get the docs in a collection.

```bash
get people
```

##### limit

To limit the number of docs returned.

```bash
get people 2
```

##### where

To get docs where the age is 20.

```bash
get people ["age","==",20]
```

:::info
You can use [the same operators as Firestore](https://firebase.google.com/docs/firestore/query-data/queries#query_operators), which includes `==`, `!=`, `>`, `>=`, `<`, `<=`, `in`, `not-in`, `array-contains`, and `array-contains-any`.
:::

##### sort

To sort by age in descending order.

```bash
get people ["age","desc"]
```

:::info
Single field indexes are automatically generated. But to sort by more than 1 field, multi-field indexes need to be added explicitly. Read onto the following section.
:::

### Add Indexes
To set an index to sort people first by age in descending order, then by name in ascending order.

```bash
addIndex [["age","desc"],["name","asc"]] people

get people ["age","desc"] ["name"] 
```

### Special Operations

WeaveDB has shortcuts for common operations which only works with the SDK and not with the terminal for now.

##### inc

To increment a number, or add an arbitrary number to a field,

```javascript
// increment
await db.update({age: db.inc(1)}, "people", "Bob")

// add 10
await db.update({age: db.inc(10)}, "people", "Bob")

// subtract 10
await db.update({age: db.inc(-10)}, "people", "Bob")
```

##### union

To add elements to an array,

```javascript
await db.update({fav_foods: db.union("beef", "milk")}, "people", "Bob")
```
##### remove

To remove elements from an array,

```javascript
await db.update({fav_foods: db.remove("beef", "milk")}, "people", "Bob")
```
##### del

To delete a field,

```javascript
await db.update({age: db.del()}, "people", "Bob")
```

##### ts

To set the block timestamp to a field,

```javascript
await db.update({birthday: db.ts()}, "people", "Bob")
```
##### signer

To set the query signer to a field,

```javascript
await db.update({wallet_address: db.signer()}, "people", "Bob")
```

### Set up Schema

WeaveDB utilizes [JSON Schema](https://json-schema.org/) to validate incoming data.

For example, let's set a schema to the `people` collection.

```javascript
{
  type: "object",
  required: ["name", "age"],
  properties: {
    name: { type: "string" },
    age: { type: "number" }
  }
}
```

This means 

- the document must be an `object`
- `name` and `age` fields are required
- `name` must be `string`
- `age` must be `number`

To add the schema, click `Schema` in the side menu, select `people` from collection list, then click `+` in the top right corner of the Schema box. You can copy & paste the schema object above to the popped-up textarea and hit `Add`.

![](https://i.imgur.com/DC4ROIm.png)

Now you cannot add a document to `people` violating the schema, such as

```bash
set {name:123,age:"Bob"} people Bob
```

### Set up Access Control Rules

With decentralized DBs, it's extremely essential to control who can update what, since it's permissionless by default. WeaveDB has a powerful mechanism to precisely set up any advanced logic to your DB instance by combining [JsonLogic](https://jsonlogic.com/) and [FPJSON](https://fpjson.weavedb.dev).

In this tutorial, we will only explore basic `JsonLogic` parts.

You can set up rules to either the entire write operation with `write` or specific operations with`create`, `update` and `delete`.

So `write` = `create` + `update` + `delete`.

Within the rules, you can access [various information](https://docs.weavedb.dev/docs/sdk/rules#preset-variables) about contract, block, transaction, and data to be uploaded.

```javascript
{
  contract: { id, owners },
  request: {
    auth: { signer, relayer, jobID, extra },
    block: { height, timestamp },
    transaction: { id },
    resource: { data },
    id,
    path,
  },
  resource: { data, setter, newData, id, path },
}
```

And with JsonLogic, you can use `var` to access variables, such as `{var: "resource.newData.user"}` to access the `user` field of the newly updated data.

For example, the following rules ensure that the uploader's wallet address(`request.auth.signer`) is set to `user` field of the updated data(`resource.newData.user`) on `create`, and the uploader's wallet address(`request.auth.signer`) equals to the existing `user` field(`resource.data.user`) on `update`.

`resource.newData` is the data after the query is applied, and `resource.data` is the existing data before the query is applied.

This ensures only the original data updaters can update their own data.

```javascript
{
  "allow create": {
    "==": [{ var: "request.auth.signer" }, { var: "resource.newData.user" }]
  },
  "allow update": {
    "==": [{ var: "request.auth.signer" }, { var: "resource.data.user" }]
  }
}
```

To combine multiple operations, chain them with `,` like `allow create,update`.

To add the rules, click `Access Control Rules` in the side menu, select `people` from the Collection list, then click `+` in the top right corner of the Rules box. You can copy & paste the rules object above to the popped-up textarea and hit `Add`.

![](https://i.imgur.com/KkVlQTH.png)

Now if you try to update an existing data with another wallet, the transaction will fail.

:::info
With [FPJSON](https://fpjson.weavedb.dev/), you can do powerful things such as mutating the updated data and adding extra fields.
:::


## Intermediate

Now, let's connect with the DB instance from a front-end dapp. You need to use `weavedb-sdk` for that.

To install,

```bash
yarn add weavedb-sdk
```
To use in a front-end dapp,

```javascript
import SDK from "weavedb-sdk"

const db = new SDK({ contractTxId })
await db.initializeWithoutWallet()

const people = await db.get("people")
```

### Execute Queries

To add a doc with the browser connected Metamask,

```javascript
const bob = {
  name: "Bob",
  age: 20
}

const await db.add(bob, "people")
```

:::info
Other wallets can also be authenticated, which includes Arweave, Internet Identity, IntmaxWallet and Lens Profile.
:::

To authenticate a user by generating a disposal address,

```javascript
const { identity } = await db.createTempAddress()

const await db.add(bob, "people", identity)
```
:::info
By generating a disposal address, dapp users won't be asked for a signature with a wallet popup every time they are to send a transaction. The disposal key stored in browser storage will auto-sign transactions.
:::


### Example with NextJS

Let's build the simplest dapp to connect with WeaveDB from the client-side with [NextJS](https://nextjs.org/). Make sure you have `yarn` and `create-next-app` installed.

```bash
yarn create next-app
cd my-app
yarn add weavedb-sdk
yarn dev
```
Now you have a local app running at [localhost:3000](http://localhost:3000).


Replace `/page/index.js` with the following. Styles for UI are intentionally omitted for simplicity.

```jsx
import { useState, useEffect } from "react"
import SDK from "weavedb-sdk"
let db
export default function Home() {
  const [user, setUser] = useState(null)
  const [txid, setTxId] = useState(null)
  useEffect(() => {
    ;(async () => {
      // initialize the SDK on page load
      db = await new SDK({
        contractTxId: "your_contractTxId",
      })
      await db.initializeWithoutWallet()
    })()
  })

  return user === null ? ( // show Login button if user doesn't exist
    <div
      onClick={async () => {
        // generate a disposal address
        const { identity } = await db.createTempAddress()
        // and set the identity to user
        setUser(identity)
      }}
    >Login</div>
  ) : txid === null ? (
    <div
      onClick={async () => {
        // WeaveDB will immediately return the result using virtual state
        const tx = await db.set({ name: "Bob", age: 20 }, "people", "Bob", {
          ...user,
          onDryWrite: {
            read: [ // you can execute instant read queries right after dryWrite
              ["get", "people", "Bob"],
              ["get", "people"],
            ],
          },
        })
        // the dryWrite result will be returned instantly (10-20ms)
        console.log(tx)
        
        // to get the actual tx result, use getResult. This will take 3 secs.
        const result = await tx.getResult()
        console.log(result)
        // set the transaction id to txid
        setTxId(result.originalTxId)
      }}
    >Add Bob</div>
  ) : ( // show a link to the transaction record
    <a href={`https://sonar.warp.cc/#/app/interaction/${txid}`} target="_blank">{txid}</a>
  )
}

```

The WeaveDB SDK keeps a virtual state locally and immediately returns a result (dryWrite) without sending the transaction first, which takes only around 10ms. If you need to get the actual transaction result, you can use `getResult`, which takes around 3-4 seconds.

You can also pack any number of dryRead queries with `onDryWrite.read` to immediately execute on the result of the dryWrite.

For a great UX, dapps would utilize dryWrite/dryRead, which, in most cases, takes less than 50ms, whereas the equivalent tx without dryWrite could take 4-5 seconds.

:::info
The WeaveDB dryWrite with a virtual state is faster than the WarpSDK dryWrite which requires a http call to sync with the latest state. But it might give you a different result from the actual finality. If there is any discrepancy, it will be solved in 5 seconds. But handle the dryWrite results with care.
:::

:::info
The SDK needs to be initialized with an Arweave wallet to send transactions to Arweave, but for now you don't have to pay for any transactions. So you can initialize it with a randomly generated wallet with `initializeWithoutWallet`.
:::

## Advanced

Let's build an actual dapp, utilizing what you learned in this tutorial so far.

We are going to build a simple todo dapp.

![](https://i.imgur.com/7Rj7oQD.png)

Coming Soon...

## Going Further

WeaveDB is extremely powerful if you get familiar with advanced usages.

- FPJSON to build advanced logic
- Cron Jobs to periodically update data
- Contract management / Upgradability
- Authentication with other wallets
- Verifiable relayers to process external data
- Cross-chain data bridge with Lit Protocol
- Using gRPC node for performance boost
- Building scalable [Lens Protocol](https://www.lens.xyz/) dapps
