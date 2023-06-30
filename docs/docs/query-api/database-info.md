---
sidebar_position: 3
---

# Database Info

:::info
`db` is assumed to be the state variable storing the WeaveDB SDK object.

For references, see [Initialize WeaveDB](/docs/get-started#initialize-weavedb)
:::

## getInfo

Get general information about your database.

```js
await db.getInfo()
```

## getVersion

Get contract version of your database.

```js
await db.getVersion()
```

## getHash

Get current hash of chained txs. 

:::info
WeaveDB contracts keep track of valid transactions by hashing chained txIds like blockchain.  
`latest_hash` = hash( [ `last_hash`, `current_txId` ] )
:::

```js
await db.getHash()
```

<!-- /docs/sdk/evolve.md -->
## getEvolve

To get the stats related to evolve, use `getEvolve`.

```js
await db.getEvolve()
// { canEvolve, history, evolve, isEvolving }
```

<!-- ## getAlgorithms -->

<!-- /docs/sdk/ownership.md -->
## getOwner

Get contract owners of your database.

```js
await db.getOwner()
```

<!-- /docs/permissions/schemas.md -->
## getSchema

Get the schema of a collection

```js
await db.getSchema("your_collection_name")
```

<!-- ## getIndex -->


<!-- /docs/sdk/crons.md -->
## getCrons

```js
await db.getCrons()
```

<!-- /docs/sdk/relayers.md -->
## getRelayerJob

```javascript
await db.getRelayerJob("your_jobID")
```

<!-- ## getLinkedContract -->


<!-- /docs/sdk/relayers.md -->
## listRelayerJobs

```javascript
await db.listRelayerJobs()
```