---
sidebar_position: 2
---

# Quick Start

This tutorial will guide you through the process of deploying your first WeaveDB database and teach you how to interact with it.

## Database Structure

WeaveDB is structured in a hierarchical manner, with each instance consisting of collections, each collection consisting of documents, and each document containing data fields and sub-collections.

Here's an illustration to help visualize this hierarchy:

![](https://i.imgur.com/aiLhOha.png)

As an example, let's say we define a collection called people, which could contain three documents, as shown below:

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

## Create a Database

To deploy a WeaveDB database, follow these steps:

1. Go to [console.weavedb.dev](https://console.weavedb.dev/).

2. Click on the Deploy WeaveDB button.

![](https://i.imgur.com/4kzNNZr.png)

3. Connect your wallet by clicking on Connect Owner Wallet. This wallet will serve as the admin account for configuring your database.

![](https://i.imgur.com/dSZfEQ1.png)

4. Set `Secure` to `False` for the purposes of this tutorial. (Note: In a production setting, you should never set `Secure` to `False`.)

5. Finally, click on `Deploy DB Instance`. Your WeaveDB database will be deployed to the mainnet in just a few seconds. You can view the transaction for the deployment by clicking on the `contractTxId` link.

![](https://i.imgur.com/vL4d75W.png)

## Query your Database

WeaveDB has a similar syntax to [Firestore](https://firebase.google.com/docs/firestore/query-data/get-data) but simplified and expressed as a simple JSON array (e.g.`["get", "people", "Bob"]`). It is stored as a smart contract state and composed with other snippets. This is the key to the WeaveDB's advanced logic building using [FPJSON](https://fpjson.weavedb.dev), which is out of the scope of this tutorial.

To begin interacting with your WeaveDB database, sign in with your owner wallet by following these steps:

1. Click on the `Sign Into DB` button.

![](https://i.imgur.com/UDaASKa.png)

2. Once signed in, you can execute queries in the bottom terminal.

![](https://i.imgur.com/N0K8st0.png)

:::caution
When using the bottom terminal, try not to insert spaces in objects. Spaces are used to separate arguments so it will be parsed incorrectly, or wrap the object with `'` or `"`.
:::

### Get Info

To get general information about your database:

```bash
getInfo
```

### Add

To add a doc to a collection. The doc ID will be auto-generated:

```bash
# add : data_JSON : collection_name
add {name:"Bob",age:20} people
```

To set, update, delete, or upsert a doc, you can use the following commands followed by the new data, the collection name, and the doc name as arguments:

### Set

```bash
# set : data_JSON : collection_name : doc_name
set {name:"Bob",age:20} people Bob
```

### Update

```bash
# update : data_JSON : collection_name : doc_name
update {age:30} people Bob
```
### Delete

```bash
# delete : collection_name : doc_name
delete people Bob
```

### Upsert

```bash
# upsert : data_JSON : collection_name : doc_name
upsert {name:"Bob",age:20} people Bob
```

The defferences between `set`, `upsert`, `update` are:

- `set` will reset the whole doc if the doc already exists.
- `update` will fail if the doc does not exist.
- `upsert` will merge the new data with an existing doc or will add a new doc if it does not already exist.


### Get

Let's add some people for the following tutorial:

```bash
set {name:"Bob",age:20} people Bob
set {name:"Alice",age:30} people Alice
set {name:"Mike",age:40} people Mike
```

To get a single doc:

```bash
get people Bob 
```

To get the docs in a collection:

```bash
get people
```

#### Limit

To limit the number of docs returned:

```bash
get people 2
```

#### Where

To get docs where the age is 20:

```bash
get people ["age","==",20]
```

:::info
You can use [the same operators as Firestore](https://firebase.google.com/docs/firestore/query-data/queries#query_operators), which includes `==`, `!=`, `>`, `>=`, `<`, `<=`, `in`, `not-in`, `array-contains`, and `array-contains-any`.
:::

##### sort

To sort by age in descending order:

```bash
get people ["age","desc"]
```

:::info
Single field indexes are automatically generated. But to sort by more than 1 field, multi-field indexes need to be added explicitly. Read onto the following section.
:::

### Add Multi-Field Indexes
To set an index to sort people first by age in descending order, then by name in ascending order:

```bash
addIndex [["age","desc"],["name","asc"]] people

get people ["age","desc"] ["name"] 
```

### Special Operations

WeaveDB has shortcuts for common operations which only work with the [SDK](https://docs.weavedb.dev/docs/category/weavedb-sdk) and not with the terminal for now.

##### inc

To increment a number, or add an arbitrary number to a field:

```javascript
// increment
await db.update({age: db.inc(1)}, "people", "Bob")

// add 10
await db.update({age: db.inc(10)}, "people", "Bob")

// subtract 10
await db.update({age: db.inc(-10)}, "people", "Bob")
```

##### union

To add elements to an array:

```javascript
await db.update({fav_foods: db.union("beef", "milk")}, "people", "Bob")
```
##### remove

To remove elements from an array:

```javascript
await db.update({fav_foods: db.remove("beef", "milk")}, "people", "Bob")
```
##### del

To delete a field:

```javascript
await db.update({age: db.del()}, "people", "Bob")
```

##### ts

To set the block timestamp to a field:

```javascript
await db.update({birthday: db.ts()}, "people", "Bob")
```
##### signer

To set the query signer to a field:

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

This means:

- the document must be an `object`
- `name` and `age` fields are required
- `name` must be `string`
- `age` must be `number`

To add the schema, click `Schema` in the side menu, select `people` from collection list, then click `+` in the top right corner of the Schema box. You can copy & paste the schema object above to the popped-up textarea and hit `Add`.

![](https://i.imgur.com/DC4ROIm.png)

Now you cannot add a document to `people` violating the schema, such as:

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

This ensures only the original data updaters can update their own data:

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

### Connecting from Frontend

Now, let's connect with the DB instance from a front-end dapp. You need to use `weavedb-sdk` for that.

To install:

```bash
yarn add weavedb-sdk
```
To use in a front-end dapp:

```javascript
import SDK from "weavedb-sdk"

const db = new SDK({ contractTxId })
await db.initializeWithoutWallet()

const people = await db.get("people")
```

#### Execute Queries

To add a doc with the browser connected Metamask:

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

To authenticate a user by generating a disposal address:

```javascript
const { identity } = await db.createTempAddress()

const await db.add(bob, "people", identity)
```
:::info
By generating a disposal address, dapp users won't be asked for a signature with a wallet popup every time they are to send a transaction. The disposal key stored in browser storage will auto-sign transactions.
:::


#### Example with NextJS

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
  },[])

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

### Authentication

User authentication on WeaveDB is purely done by cryptography without any centralized components.

There are 5 wallet integrations at the moment, which includes:

- [Metamask](https://metamask.io/) ([EVM](https://ethereum.org/en/developers/docs/evm/)) - `secp256k1`
- [Internet Identity](https://identity.ic0.app/) ([Dfinity](https://dfinity.org/)) - `ed25519`
- [ArConnect](https://www.arconnect.io/) ([Arweave](https://arweave.org/)) - `rsa256`
- [IntmaxWallet](https://www.intmaxwallet.io/) ([Intmax zkRollup](https://intmax.io/)) - `secp256k1-2` | `poseidon`
- [Lens Profile](https://polygonscan.com/token/0xdb46d1dc155634fbc732f92e853b10b288ad5a1d) ([Lens Protocol](https://lens.xyz)) - `secp256k1-2`

![](/img/wallets.png)

We will use only EVM, Arweave and Lens for this tutorial.

#### Set Auth Algorithms

You can enable/disable authentication by setting required algorithms listed above.

`secp256k1` is for [EIP712](https://eips.ethereum.org/EIPS/eip-712) typed structured data signatures and `secp256k1-2` is for regular [EIP191](https://eips.ethereum.org/EIPS/eip-191) signatures used in Lit Action.

For example, to enable only EVM, Arweave and Lens.
```bash
setAlgorithms ["secp256k1","rsa256","secp256k1-2"]
```

#### Lens Protocol Profiles

Lens Profiles are Polygon NFTs, which requires a different way to securely verify them across chains. WeaveDB utilizes [Lit Protocol](https://litprotocol.com/) to validate ownerships of Lens Profiles in a decentralized and verifiable fashion.

![](/img/lens-auth.png)

The [Lit Action](https://developer.litprotocol.com/coreConcepts/LitActionsAndPKPs/actions/litActions) is [an immutable script stored in IPFS](https://cloudflare-ipfs.com/ipfs/QmYq1RhS5A1LaEFZqN5rCBGnggYC9orEgHc9qEwnPfJci8), which validates ownerships of Lens Profiles and signs WeaveDB queries with a PKP ([Programmable Key Pair](https://developer.litprotocol.com/coreConcepts/LitActionsAndPKPs/PKPs)). The privateKeys of PKPs are decentralized by [threshold cryptography](https://academy.binance.com/en/articles/threshold-signatures-explained) and controled by NFT to grant access to Lit Action scripts, but we use the [Mint/Grant/Burn](https://developer.litprotocol.com/coreconcepts/litactionsandpkps/intro/#what-is-mintgrantburn) technique to immediately abandon the ownership after granting access to only one IPFS address, so the PKP(0xF810D4a6F0118E6a6a86A9FBa0dd9EA669e1CC2E) associated with the IPFS script can only produce signatures within that script.

So any queries signed by the PKP are guaranteed to be validated through the immutable IPFS script of Lit Action, which securely bridges data from Polygon to WeaveDB (Arweave). WeaveDB verifies the PKP signature and links the verified Lens Profile to a disposal EVM address, so the user doesn't have to repeat this authentication process again.

To enable the Lens authentication, you need to set up a relayer job (`auth:lens`) so the Lit Action can function as [a WeaveDB relayer](/docs/sdk/relayers). But the whole setup is taken care of by [Web Console](https://console.weavedb.dev), if you leave the Lens check marked when deploying your contract.

![](/img/lens-check.png)


#### Generating Disposal Key Pair

For optimal UX for dapp users, you would want to generate a disposal key pair and let it auto-sign transactions without wallet pop-ups evey time they are to update data.

We will explore the disposal key flow, but for any other usages, refer to [the Authentication document](/docs/sdk/auth).

```javascript
// with Metamask
const { tx, identity } = await db.createTempAddress()

// with ArConnect
const { tx, identity } = await db.createTempAddressWithAR()

// with Lens Profile
const { tx, identity } = await db.createTempAddressWithLens()
```

You can also set an expiry date to disposal keys.

```javascript
const expiry = 60 * 60 * 24 * 3 // 3 days

// with Metamask, the first argument is to manually set the wallet
const { tx, identity } = await db.createTempAddress(null, expiry)

// with ArConnect
const { tx, identity } = await db.createTempAddressWithAR(null, expiry)

// with Lens Profile
const { tx, identity } = await db.createTempAddressWithLens(expiry)
```

The `identity` object.

```javascript
const identity = {
  privateKey, // the disposal account privKey
  publicKey, // the disposal account pubKey
  address, // the disposale account address
  linkedAccount, // the original account address, `lens:123` for lens
  signer, // the generator of the identity, same as linkedAddress except for lens
  type, // evm | ar | ii | intmax | lens
  profile // only for Lens, e.g.) `identity.profile.handle` to get handle
}
```
To execute queries, set the `identity` as the last argument to any write query.

```javascript
await db.set(data, "people", "Bob", identity)
await db.delete(data, "people", "Bob", identity)
```


#### Using Signer in Access Control Rules

As explained [earlier](/docs/quick-start#set-up-access-control-rules), you can access the signer (`request.auth.signer`) in access control rules.

The signer will be the original address(`identity.linkedAccount`) and not the disposal EVM address(`identity.address`).

And for Lens Profile, the format is `lens:[tokenID]`. So if your tokenID is `123`, you will get `lens:123` as the signer.

Once again, to restrict the data update to only the original owner.

```javascript
{
  "allow create": { // signer must be set to `user` field
    "==": [{ var: "request.auth.signer" }, { var: "resource.newData.user" }]
  },
  "allow update": { // signer must be the same as `user`
    "==": [{ var: "request.auth.signer" }, { var: "resource.data.user" }]
  }
}
```

By using `let` you can [mutate or add extra data](/docs/sdk/rules#add-on-json-based-functional-programming) to the updated data.

For example, the following assigns the `signer` to `user` field of the updated data on `create`.

```javascript
{
  "let create": { // assign signer to `user`
    "resource.newData.user" : { var: "request.auth.signer" }
  }
}
```

#### Example with NextJS

Set the following access control rules to `users` collection using [the Web Console](https://console.weavedb.dev).

```javascript
{
  "let create": {
    "resource.newData.user" : { var: "request.auth.signer" }
  },
  "allow create": true
}
```

Frontend code.

```jsx
import { useState, useEffect } from "react"
import SDK from "weavedb-sdk"
import lf from "localforage" // to store user in indexedDB for persistence

let db
export default function Home() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    ;(async () => {
	  // check if an authenticated user exists
      setUser((await lf.getItem("identity")) || null)

      // initialize SDK
      const _db = await new SDK({ contractTxId: "your_contractTxId" })
      await _db.initializeWithoutWallet()
	  
	  // fetch all users
      setUsers(await _db.get("users"))
	  
      db = _db
    })()
  }, [])

  // on creating a disposal key pair
  const regUser = async ({ tx, identity }) => {
    if (!tx.success) return
	
	// set user
    setUser(identity)
	
	// store user for persistence between page reload
    await lf.setItem("identity", identity)
	
	// also save user to WeaveDB, the access control rules fill user address
    await db.set(
      { type: identity.type },
      "users",
      identity.linkedAccount,
      identity
    )
  }

  return (
    <>
      {user === null ? (
        <>
          <div onClick={async () => regUser(await db.createTempAddress())}>
            Login with Metamask
          </div>
          <div
            onClick={async () => regUser(await db.createTempAddressWithAR())}
          >
            Login with Arweave
          </div>
          <div
            onClick={async () => regUser(await db.createTempAddressWithLens())}
          >
            Login with Lens Profile
          </div>
        </>
      ) : (
        <div
          onClick={async () => {
		    // unset user
            setUser(null)
			
			// remove locally stored user
            await lf.removeItem("identity")
          }}
        >
          Logout ({user.linkedAccount})
        </div>
      )}
      <hr />
      {users.map(v => { // render all users
        return (
          <div>
            {v.type}: {v.user}
          </div>
        )
      })}
    </>
  )
}
```

## Advanced

### Building Lens Dapp
Let's build an actual dapp, utilizing what you learned in this tutorial so far.

We are going to build a simple Twitter-like dapp using Lens Profile.

You can try the working demo at [relayer-lens-lit.vercel.app](https://relayer-lens-lit.vercel.app/).

![](/img/lensweave.png)

#### 1. Deploy DB Instance

The first step is [to deploy a WeaveDB contract](/docs/quick-start#deploy-contract) to the mainnet. Set `Secure` to `false` so no one can update by default. Take note of the `contractTxId`.

#### 2. Set up Schemas

For this dapp, we will define 2 collections - `users` and `posts`. For example, the following is how we want the data to be.

```javascript
const user = { 
  name: "Tomoya | WeaveDB", 
  uid: "lens:97912", 
  handle: "tomoya.lens",
  image: "https://cloudflare-ipfs.com/ipfs/QmU51aQqJb6rwsjTYbUodMWRLJUVimdrHKcWwZARXVajzP"
}

const post = {
  id: "YeIXjVbsUqHL4SYl0tW-I",
  body: "WeaveLens is fully decentralized!",
  user: "lens:97912",
  date: 1678587066647
}
```

The JSON schema for each collection would be something like the following.

```javascript
// for users, note `image` is not required
{
  "type": "object",
  "required": [ "name", "uid", "handle" ],
  "properties": {
    "name": { "type": "string" },
    "uid": { "type": "string" },
    "handle": { "type": "string" },
    "image": { "type": "string" }
  }
}

// for posts
{
  "type": "object",
  "required": [ "user", "body", "date", "id" ],
  "properties": {
    "id": { "type": "string" },
    "body": { "type": "string" },
    "user": { "type": "string" },
    "date": { "type": "number" }
  }
}
```

Set these up using [the Web Console](/docs/quick-start#set-up-schema).

#### 3. Set up Access Control Rules

For users, we want the docid to be the same as `uid` and users can only update theire own data.

```javascript
{
  "allow create": {
    "and": [
      // docid must be the same as uid
      { "==": [{ "var": "request.id" }, { "var": "resource.newData.uid" }] },
	  
	  // uid must be the same as signer
      { "==": [{ "var": "resource.newData.uid" }, { "var": "request.auth.signer" }] }
    ]
  },
  "allow update": {
    "and": [
      // docid must be the same as uid	
      { "==": [{ "var": "request.id" }, { "var": "resource.newData.uid" }] },
	  
	  // uid must be the same as signer	  
      { "==": [{ "var": "resource.data.uid" }, { "var": "request.auth.signer" }] },
	  
	  // uid cannot be updated
	  { "==": [{ "var": "resource.data.uid" }, { "var": "resource.newData.uid" }] },
	  
	  // handle cannot be updated
	  { "==": [{ "var": "resource.data.handle" }, { "var": "resource.newData.handle" }] }
    ]
  }
}
```

For posts, we want the docid to be in the format of `[user]:[id]`, and users can only delete their own posts.

```javascript
{
  "let create": { // define `id` variable to use later
    id: [ "join", ":", [{ var: "resource.newData.user" }, { var: "resource.newData.id" }] ]
  },
  "allow create": {
    and: [
	  // the signer must be `user`
      { "==": [{ var: "resource.newData.user" }, { var: "request.auth.signer" }] },
	  
	  // the docid must be the same as the predefined `id`
      { "==": [{ var: "request.id" }, { var: "id" }] }
    ]
  },
  "allow delete": { // the signer must be `user`
    "==": [{ var: "request.auth.signer" }, { var: "resource.data.user" }]
  }
}
```
Set these up using [the Web Console](/docs/quick-start#set-up-access-control-rules).

#### 4. Frontend Dapp

You can view the entire frontend code [here](https://github.com/weavedb/weavedb/tree/master/examples/relayer-lens-lit).

To run it,

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb/examples/relayer-lens-lit
yarn
```
Create `.env.local` and set your `contractTxId` to `NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID`.

```bash
NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID="your_contractTxId"
```

Then, 

```bash
yarn dev
```

## Going Further

WeaveDB is extremely powerful if you get familiar with advanced usages.

- [FPJSON](https://fpjson.weavedb.dev) to build advanced logic
- [Cron Jobs](/docs/sdk/crons#json-based-functional-programming) to periodically update data
- Contract management / [Upgradability](/docs/sdk/evolve)
- Verifiable [relayers](/docs/sdk/relayers) to process external data
- Cross-chain data bridge with [Lit Protocol](/docs/sdk/relayers#verifiable-oracles-with-lit-protocol)
- Using [gRPC node](/docs/advanced/node) for performance boost
