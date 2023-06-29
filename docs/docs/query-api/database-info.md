---
sidebar_position: 3
---

# Database Info

## getInfo

Get general information about your database

```js
await db.getInfo()
```

## getVersion

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

```js
await db.getOwner()
```

<!-- /docs/permissions/schemas.md -->
## getSchema

Get the schema of a collection

```js
await db.getSchema(schema, "bookmarks")
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
await db.getRelayerJob("jobID")
```

<!-- ## getLinkedContract -->


<!-- /docs/sdk/relayers.md -->
## listRelayerJobs

```javascript
await db.listRelayerJobs()
```