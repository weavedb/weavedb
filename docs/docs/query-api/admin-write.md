---
sidebar_position: 4
---

# Admin Write

<!-- /docs/sdk/indexes.md -->
## addIndex

```javascript
await db.addIndex([ [ "age" ], [ "height", "desc" ] ], "collection_name")
```

<!-- /docs/sdk/indexes.md -->
## removeIndex

```javascript
await db.removeIndex([ [ "age" ], [ "height", "desc" ] ], "collection_name")
```

<!-- /docs/permissions/rules.md -->
## setRules

```javascript
await db.setRules({"allow write": true}, "collection_name")
```

<!-- /docs/permissions/schemas.md -->
## setSchema

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
await db.setSchema(schema, "collection_name")
```

<!-- /docs/sdk/crons.md -->
## addCron

```js
const cron = {
  start: 1659505371,
  span: 60 * 60 * 12,
  do: true,
  times: 10,
  jobs: [ [ "upsert", { times: db.inc(1) }, "conf", "count-crons" ] ]
}
await db.addCron(cron, "collection_name")
```


<!-- ## removeCron -->

<!-- /docs/sdk/evolve.md -->
## evolve

DB contracts can be upgraded to a new version with `evolve` if `canEvolve` is set `true`.

The new version has to be deployed first, and pass the `contractTxId` of the new contract to the `evolve` function.

```js
await db.evolve(contractTxId, { ar: arweave_wallet })
```

<!-- /docs/sdk/evolve.md -->
## migrate

After evolving you need execute `migrate`. The write operations will be blocked before the migration.

```js
await db.migrate(newVersion, { ar: arweave_wallet })
```

<!-- /docs/authentication/auth.md -->
## setAlgorithms

WeaveDB defaults to use all algorithms, but you can specify authentication algorithms to enable for your instance.

For example, to enable Arweave, and disable the others.

```javascript
await db.setAlgorithms([ "rsa256" ])
```

<!-- /docs/sdk/evolve.md -->
## setCanEvolve

Upgradability can be switched by `setCanEvolve`. Only contract owners can execute the function.

```js
await db.setCanEvolve(false, { ar: arweave_wallet })
```

## setSecure

```js
await db.setSecure(false)
```

<!-- ## addOwner -->


<!-- ## removeOwner -->


<!-- ## linkContract -->


<!-- ## removeContract -->