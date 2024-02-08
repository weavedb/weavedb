---
sidebar_position: 2
---
# Deploy Contracts

## Initial States

Modify [initial-state.json](https://github.com/weavedb/weavedb/blob/master/src/contracts/initial-state.json) if necessary.

Setting `secure` `false` will let anyone write anything to your DB, which only makes sense for test purposes during development.

For production, leave `secure` `true` and set [access control rules](/docs/sdk/rules) to each collection.

```json
{
  "canEvolve": true,
  "evolve": null,
  "secure": true,
  "data": {},
  "nonces": {},
  "ids": {},
  "indexes":{},
  "auth":{
    "name": "weavedb",
    "version": "1",
    "links": {}
  }
}
```

## Deploy Your Own WeaveDB Contracts

Warp has a way to deploy a new contract by duplicating already deployed contracts.

So you can deploy your own WeaveDB instance with one command, which copies from our official deployment (currently v.0.2).

Deploy on the Warp mainnet.

```bash
node scripts/generate-wallet.js mainnet
yarn deploy
```

Testnet deployment has been deprecated as it's not so stable. You can test on the mainnet for free, or we are going to develop a local test environment soon.
