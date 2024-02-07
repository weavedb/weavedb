---
sidebar_position: 11
---
# Evolve Contract

Database contracts are upgradable with `evolve` function, if set so.

## Get Evolve Stats

To get the stats related to evolve, use `getEvolve`.

```js
await db.getEvolve()
// { canEvolve, history, evolve, isEvolving }
```

## Make DB Contract Upgradable

When deploying the WeaveDB contract, `canEvolve` should be set `true`, and `evolve` should be set `null` in the initial state.

```js
{
  "canEvolve": true,
  "evolve": null,
  "secure": true,
  "version": "0.7.0",
  "data": {},
  "nonces": {},
  "ids": {},
  "indexes": {},
  "auth":{
    "algorithms": ["secp256k1", "secp256k1-2", "ed25519", "rsa256", "poseidon"],
    "name": "weavedb",
    "version": "1",
    "links": {}
  },
  "crons": {
    "lastExecuted": 0,
    "crons":{}
  },
  "contracts":{}
}
```

## Switch Upgradability

Upgradability can be switched by `setCanEvolve`. Only contract owners can execute the function.

```js
await db.setCanEvolve(false, { ar: arweave_wallet })
```

## Upgrade / Evolve DB Contract

DB contracts can be upgraded to a new version with `evolve` if `canEvolve` is set `true`.

The new version has to be deployed first, and pass the `contractTxId` of the new contract to the `evolve` function.

```js
await db.evolve(contractTxId, { ar: arweave_wallet })
```

After evolving you need execute `migrate`. The write operations will be blocked before the migration.

```js
await db.migrate(newVersion, { ar: arweave_wallet })
```
