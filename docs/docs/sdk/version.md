---
sidebar_position: 11
---
# Version

WeaveDB is in heavy development and rapidly evolving. The contract version can be obtained via `getVersion` and you can upgrade the contract if you need features added to a new version.

## Get Version

WeaveDB complies with [Semantic Versioning](https://semver.org/).

```js
await db.getVersion()
```

## Change Logs

### v0.7.0 (Nov 27, 2022)

#### Source Transaction Id

[7vXOxkxZ_eG0mwBO4pc_mB_oh1MY4pmHXzRQJfdMGCw](https://sonar.warp.cc/#/app/source/7vXOxkxZ_eG0mwBO4pc_mB_oh1MY4pmHXzRQJfdMGCw)

#### Added Features

- ownership management
- evolve management
- expiry to temporary addresses
- Intmax wallet integration
- contract versioning
- link plugin contracts
- getAddressLink

