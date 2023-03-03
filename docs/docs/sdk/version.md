---
sidebar_position: 12
---
# Version

WeaveDB is in heavy development and rapidly evolving. The contract version can be obtained via `getVersion` and you can upgrade the contract if you need features added to a new version.

## Get Version

WeaveDB complies with [Semantic Versioning](https://semver.org/).

```js
await db.getVersion()
```

## Change Logs

### v0.23.0 (Mar 03, 2023)

#### Source Transaction Id

[_gUR1-XzkZhsMlzZLIUEYp-rg73b9W-bhSrRIb06zKk](https://sonar.warp.cc/#/app/source/_gUR1-XzkZhsMlzZLIUEYp-rg73b9W-bhSrRIb06zKk)

#### Added Features

- [`=` deprecated](/docs/sdk/queries#get--cget)

### v0.22.0 (Mar 02, 2023)

#### Source Transaction Id

[JglKj1PoKu1moG7H3uAP1HxnXRH4kDIuqQzil1ZlbLc](https://sonar.warp.cc/#/app/source/JglKj1PoKu1moG7H3uAP1HxnXRH4kDIuqQzil1ZlbLc)

#### Added Features

- [getHash()](/docs/sdk/queries#gethash) for consistency check


### v0.21.0 (Feb 21, 2023)

#### Source Transaction Id

[nNz22bZG_Y2K9r68iqnL1iOPEu8rvqCWNE4TX17OsgA](https://sonar.warp.cc/#/app/source/nNz22bZG_Y2K9r68iqnL1iOPEu8rvqCWNE4TX17OsgA)

#### Added Features

- copy new `version` to state on [migration](/docs/sdk/evolve#upgrade--evolve-db-contract) (internal change)
- return `original_signer` for grpc-node optimizations (internal change)

### v0.20.0 (Feb 8, 2023)

#### Source Transaction Id

[pfzMiEGWwoyAL33M2ceRUkgG3XvxUyjxUqiyLNHD66g](https://sonar.warp.cc/#/app/source/pfzMiEGWwoyAL33M2ceRUkgG3XvxUyjxUqiyLNHD66g)

#### Added Features

- [batch execution of admin methods](/docs/sdk/queries#batch)
- `contract` field to [access control rules](/docs/sdk/rules#preset-variables)

### v0.19.0 (Feb 2, 2023)

#### Source Transaction Id

[jhQ9kWIqjNYzGrg96zr7q7xbot4NwkKT8UZwsrb-fvE](https://sonar.warp.cc/#/app/source/jhQ9kWIqjNYzGrg96zr7q7xbot4NwkKT8UZwsrb-fvE)

#### Added Features

- collection id / doc id [restrictions](https://firebase.google.com/docs/firestore/quotas#collections_documents_and_fields)

### v0.18.0 (Jan 30, 2023)

#### Source Transaction Id

[fHH99N1FIxkU-vYwbg30eYHpBpOjN_Qa3k3ch73Yz04](https://sonar.warp.cc/#/app/source/fHH99N1FIxkU-vYwbg30eYHpBpOjN_Qa3k3ch73Yz04)

#### Added Features

- [setSecure()](/docs/development/repl#deploy-db-in-secure-mode)
- [migrate()](/docs/sdk/evolve#upgrade--evolve-db-contract)
- [getEvolve()](/docs/sdk/evolve#get-evolve-stats)

### v0.17.0 (Jan 28, 2023)

#### Source Transaction Id

[WEFEoY33ntimvQzUtC7bS3A1bsGRrtXST_z9E8yx9yw](https://sonar.warp.cc/#/app/source/WEFEoY33ntimvQzUtC7bS3A1bsGRrtXST_z9E8yx9yw)

#### Added Features

- [auto-index doc ids](/docs/sdk/indexes#__id__)
- [listRelayerJobs()](/docs/sdk/relayers#list-relayer-jobs)

### v0.16.0 (Jan 27, 2023)

#### Source Transaction Id

[viUyq-GD9kxDYRVkvT-NPjEvzLIgQYEx70DoliFwytQ](https://sonar.warp.cc/#/app/source/viUyq-GD9kxDYRVkvT-NPjEvzLIgQYEx70DoliFwytQ)

#### Added Features

- [better owner validation for crons](/docs/sdk/crons)

### v0.15.0 (Jan 25, 2023)

#### Source Transaction Id

[ZRREoTw94icjJVyVnCHnR7T_Q96AWLLLnYugmt9OgAQ](https://sonar.warp.cc/#/app/source/ZRREoTw94icjJVyVnCHnR7T_Q96AWLLLnYugmt9OgAQ)

#### Added Features

- [set/update subcollections](/docs/sdk/queries#set)

### v0.14.0 (Jan 24, 2023)

#### Source Transaction Id

[ThKJQwNBy2tdELecqmlG86bo9NacyMxquQef1DOLBPA](https://sonar.warp.cc/#/app/source/ThKJQwNBy2tdELecqmlG86bo9NacyMxquQef1DOLBPA)

#### Added Features

- [listCollections()](/docs/sdk/queries#listcollections) : list sub collections too

### v0.13.0 (Jan 23, 2023)

#### Source Transaction Id

[4lSfFFQIpX37GMdab6c4ZdWli33b70qu_KJan5vB1ZI](https://sonar.warp.cc/#/app/source/4lSfFFQIpX37GMdab6c4ZdWli33b70qu_KJan5vB1ZI)

#### Added Features

- [listCollections()](/docs/sdk/queries#listcollections)
- [getInfo()](/docs/sdk/queries#getInfo)

### v0.12.0 (Jan 17, 2023)

#### Source Transaction Id

[8dUFGgl05GiunNN_5LMBYEorkS2Znr1-L2JYVb0Cpm4](https://sonar.warp.cc/#/app/source/8dUFGgl05GiunNN_5LMBYEorkS2Znr1-L2JYVb0Cpm4)

#### Added Features

- [secp256k1-2 algorithm for Intmax is now settable](/docs/sdk/auth#intmaxwallet-intmax)

### v0.11.0 (Jan 15, 2023)

#### Source Transaction Id

[9vwjxsX0856iTRFsEMEXBC7UFJ3Utok_e6dFyB1s4TA](https://sonar.warp.cc/#/app/source/9vwjxsX0856iTRFsEMEXBC7UFJ3Utok_e6dFyB1s4TA)

#### Added Features

- [overwrite temporary address](/docs/sdk/auth)

### v0.10.0 (Jan 12, 2023)

#### Source Transaction Id

[F-nDTtI50sJYDJyPq3cqnQg2UApu9_bBoy8NItEPPQI](https://sonar.warp.cc/#/app/source/F-nDTtI50sJYDJyPq3cqnQg2UApu9_bBoy8NItEPPQI)

#### Added Features

- [multisig relayers](/docs/sdk/relayers#multisig-relayer)
- [Lit Protocol Integration](/docs/sdk/relayers#verifiable-oracles-with-lit-protocol)

### v0.9.0 (Dec 26, 2022)

#### Source Transaction Id

[eufj3L8Qx1JPLVnoJHWRNNj5FvJ4E8OT07MZ9BhmpT8](https://sonar.warp.cc/#/app/source/eufj3L8Qx1JPLVnoJHWRNNj5FvJ4E8OT07MZ9BhmpT8)

#### Added Features

- [relayers](/docs/sdk/relayers) : `getRelayerJob`, `setRelayerJob`, `removeRelayerJob`
- `sign` and `relay` added to [the SDKs](/docs/sdk/setup)

### v0.8.0 (Dec 18, 2022)

#### Source Transaction Id

[cvDUleFkH8v_hU-pBwInngotLszGpUGF-e_Ask6juwI](https://sonar.warp.cc/#/app/source/cvDUleFkH8v_hU-pBwInngotLszGpUGF-e_Ask6juwI)

#### Added Features

- compatible with warp-contracts@1.2.27 and above
- compatible with [vm2](https://github.com/patriksimek/vm2)
- using [jsonschema](https://github.com/tdegrunt/jsonschema) instead of [schemasafe](https://github.com/ExodusMovement/schemasafe)
- FPJSON may be restricted due to [Function being disabled with the Warp SDK](https://github.com/warp-contracts/warp/commit/deff303c6089299943f5230a4385297c7eb0263e#diff-b2e9f18ceda829962e5d82052d3e1c9ed69a81da6c1faca4eff0883bdace89cdR35)
- IntmaxWallet with ZKP disabled due to using vm2

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

