---
sidebar_position: 3
---
# Ownership

Only owners can execute administrative functions including `setSchema`, `setRules`, `addIndex`, `removeIndex`, `addCron`, `removeCron`, `setAlgorithms`, `evolve`, `setCanEvolve`, `addOwner`, and `removeOwner`.

## Set Initial Owners

To initially set owners with deployment, add `owner` field to the initial state. `owner` can be a single address or an array of addresses.

```js
let initialState = {
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

// single owner
initialState.owner = walletAddress

// or multiple owners
initialState.owner = [walletAddress1, walletAddress2]
```
With `yarn deploy` command, you can specify a wallet name with `--wallet` argument.

For example, save your wallet JSON file at `scripts/.wallets/wallet-my_wallet.json` first.

```bash
yarn deploy --wallet my_wallet
```

The wallet file location defaults to `scripts/.wallets/wallet-mainnet.json` if unspecified.

```bash
yarn deploy # same as "yarn deploy --wallet mainnet"
```

## Get Owner

```js
await db.getOwner()
```

## Add Owner

Owners can be added one at a time.

```js
await db.addOwner(new_owner_address, { ar: current_owner_arweave_wallet })
```

## Remove Owner

Owners can be removed one at a time. If you remove the last owner, the database won't be configuable anymore, getting into permanent decentralization mode.

```js
await db.removeOwner(owner_address, { ar: current_owner_arweave_wallet })
```
