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

### v0.33.0-beta (October 6, 2023)

#### Source Transaction Id

[hnsbAyRInY149UUDWXDTpukinxeSKB5tYJWJ5ZOz0IM](https://sonar.warp.cc/#/app/source/hnsbAyRInY149UUDWXDTpukinxeSKB5tYJWJ5ZOz0IM)

#### Added Features

- move address links to kvs
- bundle height

### v0.32.0-beta (October 5, 2023)

#### Source Transaction Id

[6z03DkIxmMYtjpSPnXX-6A5f7QsO3gnLsqkQObRiK00](https://sonar.warp.cc/#/app/source/6z03DkIxmMYtjpSPnXX-6A5f7QsO3gnLsqkQObRiK00)

#### Added Features

- getValidities
- db.ms() for rollup transaction timestamp in millisecond

### v0.31.0-beta (September 29, 2023)

#### Source Transaction Id

[GYLsyTsZK1Iay4EEKDzejddNM-KBVFBkA40lDY3eJx8](https://sonar.warp.cc/#/app/source/GYLsyTsZK1Iay4EEKDzejddNM-KBVFBkA40lDY3eJx8)

#### Added Features

- Fix nexted triggers

### v0.30.3-beta (September 28, 2023)

#### Source Transaction Id

[XVGfjnJ21jmmkCSX6ZkphakEqWpCxkC_hp-hIKyr8eI](https://sonar.warp.cc/#/app/source/XVGfjnJ21jmmkCSX6ZkphakEqWpCxkC_hp-hIKyr8eI)

#### Added Features

- Nostr integration

### v0.30.1-beta (September 27, 2023)

#### Source Transaction Id

[KDSOccSqQai2znBunj6K4GOYBXBb2tL9Z50N-oUgWoE](https://sonar.warp.cc/#/app/source/KDSOccSqQai2znBunj6K4GOYBXBb2tL9Z50N-oUgWoE)

#### Added Features

- FPJSON v0.1.5

### v0.30.0-beta (September 26, 2023)

#### Source Transaction Id

[dAmgQfZtgTVoNCpMHgcGlYdb0ab_KvCKwk0hJWD8tbk](https://sonar.warp.cc/#/app/source/dAmgQfZtgTVoNCpMHgcGlYdb0ab_KvCKwk0hJWD8tbk)

#### Added Features

- access control rule 2.0

### v0.29.2-beta (September 4, 2023)

#### Source Transaction Id

[909e5jfe_bOf4q1HE0cRRXlxcmhENzmUI8nbCUhaoRY](https://sonar.warp.cc/#/app/source/909e5jfe_bOf4q1HE0cRRXlxcmhENzmUI8nbCUhaoRY)

#### Added Features

- fix temp address error

### v0.29.1-beta (September 4, 2023)

#### Source Transaction Id

[l2Qub_LSlynUUD7cCIBf3_ElN0uQ8gzUKqkFlq1XHvo](https://sonar.warp.cc/#/app/source/l2Qub_LSlynUUD7cCIBf3_ElN0uQ8gzUKqkFlq1XHvo)

#### Added Features

- fix [trigger](/docs/sdk/triggers) bugs

### v0.29.0-beta (August 31, 2023)

#### Source Transaction Id

[9fz_LO8j7FqVsJyTlbEB2ECh5kPt6k9y8lUEX2zY2q4](https://sonar.warp.cc/#/app/source/9fz_LO8j7FqVsJyTlbEB2ECh5kPt6k9y8lUEX2zY2q4)

#### Added Features

- deterministic ID generation with input values for [add queries](/docs/sdk/queries#add)

### v0.28.16-alpha (August 28, 2023)

#### Source Transaction Id

[WdyOy81fNMhvlHokheoiQry73Ra5ODtVQVCdI1fHbjc](https://sonar.warp.cc/#/app/source/WdyOy81fNMhvlHokheoiQry73Ra5ODtVQVCdI1fHbjc)

#### Added Features

- [conditional statements in access control rules](/docs/sdk/rules#conditional-statements)
- [renaming method in access control rules](/docs/sdk/rules#renaming-method)

### v0.28.15-alpha (August 27, 2023)

#### Source Transaction Id

[rZmICMmGJjbjv8yl5PbMsOJ3OV-_WBfYdK8qOWa572E](https://sonar.warp.cc/#/app/source/rZmICMmGJjbjv8yl5PbMsOJ3OV-_WBfYdK8qOWa572E)

#### Added Features

- [get query in access control](/docs/sdk/rules#get-other-data)

### v0.28.14-alpha (August 25, 2023)

#### Source Transaction Id

[9VvyP3R36CAsF9MqeRVwmadvYAsrnh4JwlvZqSIBPVA](https://sonar.warp.cc/#/app/source/9VvyP3R36CAsF9MqeRVwmadvYAsrnh4JwlvZqSIBPVA)

#### Added Features

- [tick](/docs/sdk/crons/#tick)
- [conditional statements](/docs/sdk/crons#conditional-statements) for FPJSON

### v0.28.13-alpha (August 14, 2023)

#### Source Transaction Id

[P6CfhDCAdDDmdKrsERX-MR6ZRp_aGpa3jEhqIytworE](https://sonar.warp.cc/#/app/source/P6CfhDCAdDDmdKrsERX-MR6ZRp_aGpa3jEhqIytworE)

#### Added Features

- fix inequality indexes

### v0.28.12-alpha (August 1, 2023)

#### Source Transaction Id

[Pn8N5kerhwi6U9mYk4JQ6mVPoFGdMVzQDZiWzNtInqM](https://sonar.warp.cc/#/app/source/Pn8N5kerhwi6U9mYk4JQ6mVPoFGdMVzQDZiWzNtInqM)

#### Added Features

- [data()](/docs/sdk/queries#data)

### v0.28.11-alpha (July 30, 2023)

#### Source Transaction Id

[F_n-VWv3zYS8sxmKHaURqTJ_Y6uRvQTy70nEm-DVSns](https://sonar.warp.cc/#/app/source/F_n-VWv3zYS8sxmKHaURqTJ_Y6uRvQTy70nEm-DVSns)

#### Added Features

- fix index pagination with cursor

### v0.28.10-alpha (July 28, 2023)

#### Source Transaction Id

[vz1nYmMjPxQEviw5P20fcAb8WxRfe3APWt1w3Fcatlg](https://sonar.warp.cc/#/app/source/vz1nYmMjPxQEviw5P20fcAb8WxRfe3APWt1w3Fcatlg)

#### Added Features

- fix cron/trigger executions

### v0.28.9-alpha (July 26, 2023)

#### Source Transaction Id

[QWsm7NaS1MCC_p4nS3XUSH-6tkQSKPADxrmRCxTDWrg](https://sonar.warp.cc/#/app/source/QWsm7NaS1MCC_p4nS3XUSH-6tkQSKPADxrmRCxTDWrg)

#### Added Features

- == with !=

### v0.28.8-alpha (July 26, 2023)

#### Source Transaction Id

[W1L9vOPCnVMTzBTZhpBXp3GhxstotKGaa5C62pVj2kI](https://sonar.warp.cc/#/app/source/W1L9vOPCnVMTzBTZhpBXp3GhxstotKGaa5C62pVj2kI)

#### Added Features

- multiple == with sort

### v0.28.7-alpha (July 25, 2023)

#### Source Transaction Id

[EkkqClraVei8pndca4T2YyYKenQ9Tt6tfxJ0OkIxoXQ](https://sonar.warp.cc/#/app/source/EkkqClraVei8pndca4T2YyYKenQ9Tt6tfxJ0OkIxoXQ)

#### Added Features

- == with sort

### v0.28.6-alpha (July 25, 2023)

#### Source Transaction Id

[POv0j2x0e1ZZ_3_0CU8ZpihMTSXipjn5Yi3iLY-WP40](https://sonar.warp.cc/#/app/source/POv0j2x0e1ZZ_3_0CU8ZpihMTSXipjn5Yi3iLY-WP40)

#### Added Features

- in/not-in/!=/array-contains-any with sort

### v0.28.5-alpha (July 25, 2023)

#### Source Transaction Id

[ZF4f7cHYwNMdERuRF6nx-dQrMB65rOz4nqlpZlg3HWQ](https://sonar.warp.cc/#/app/source/ZF4f7cHYwNMdERuRF6nx-dQrMB65rOz4nqlpZlg3HWQ)

#### Added Features

- fix relay query with bundle

### v0.28.4-alpha (July 23, 2023)

#### Source Transaction Id

[sFIFcvpaDOrZ4TYrvd_OOrO-z-mN8ZD19LIMxQOk0ng](https://sonar.warp.cc/#/app/source/sFIFcvpaDOrZ4TYrvd_OOrO-z-mN8ZD19LIMxQOk0ng)

#### Added Features

- fix B+ indexer #2

### v0.28.3-alpha (July 22, 2023)

#### Source Transaction Id

[knG74NwwNXSHrVhI4UE2f6tOMilS8WF-63xBCYcYG_s](https://sonar.warp.cc/#/app/source/knG74NwwNXSHrVhI4UE2f6tOMilS8WF-63xBCYcYG_s)

#### Added Features

- fix B+ tree indexer

### v0.28.2-alpha (July 22, 2023)

#### Source Transaction Id

[f5Ic20jedVx_H_mr5K60mEWE-c4N0ht0Au_NzKnp8yo](https://sonar.warp.cc/#/app/source/f5Ic20jedVx_H_mr5K60mEWE-c4N0ht0Au_NzKnp8yo)

#### Added Features

- [setBundlers / getBundlers](/docs/sdk/queries#setbundlers--getbundlers)

### v0.28.1-alpha (July 20, 2023)

#### Source Transaction Id

[u2HMJGl5AOAnIB4S_Fsot9h6WajPgMEJBXg5OqKmvX0](https://sonar.warp.cc/#/app/source/u2HMJGl5AOAnIB4S_Fsot9h6WajPgMEJBXg5OqKmvX0)

#### Added Features

- remove signature from [bundle query](/docs/sdk/queries#bundle)

### v0.28.0-alpha (July 20, 2023)

#### Source Transaction Id

[SSq5Al8qOvfkfz-1nL1P_MsGlt9tj1gT7LTakuDsCdc](https://sonar.warp.cc/#/app/source/SSq5Al8qOvfkfz-1nL1P_MsGlt9tj1gT7LTakuDsCdc)

#### Added Features

- new B+ tree indexer

### v0.27.0-alpha (May 20, 2023)

#### Source Transaction Id

[jsZqVEOGdMFAvVlof_WXi6DO5vWxhteiG91xVPiIwqQ](https://sonar.warp.cc/#/app/source/jsZqVEOGdMFAvVlof_WXi6DO5vWxhteiG91xVPiIwqQ)

#### Added Features

- use [kv storage](https://academy.warp.cc/docs/sdk/advanced/kv-storage) for data and indexes
- [triggers](/docs/sdk/triggers)

### v0.26.5 (September 4, 2023)

#### Source Transaction Id

[1pFdmXngB5A4TXvD1cHEGNVpqdEJBYjXSmSyvy6MQiQ](https://sonar.warp.cc/#/app/source/1pFdmXngB5A4TXvD1cHEGNVpqdEJBYjXSmSyvy6MQiQ)

#### Added Features

- fix temp address bug

### v0.26.4 (July 3, 2023)

#### Source Transaction Id

[QhbIPso1lx8wbHx4c7225L9PkNYh-Djp6N_YCjqdr_E](https://sonar.warp.cc/#/app/source/QhbIPso1lx8wbHx4c7225L9PkNYh-Djp6N_YCjqdr_E)

#### Added Features

- [triggers](/docs/sdk/triggers)

### v0.26.3 (June 19, 2023)

#### Source Transaction Id

[rTp2E6oipzJODmAGbqWbo2wzagoV7tt3JRyBsyVgo6A](https://sonar.warp.cc/#/app/source/rTp2E6oipzJODmAGbqWbo2wzagoV7tt3JRyBsyVgo6A)

#### Added Features

- [dot notation](/docs/sdk/queries#where)

### v0.26.2 (June 12, 2023)

#### Source Transaction Id

[-TBbRLWsP8wAlj8y5bh7RHRdwGJ7kT9urFvEbn1UomQ](https://sonar.warp.cc/#/app/source/-TBbRLWsP8wAlj8y5bh7RHRdwGJ7kT9urFvEbn1UomQ)

#### Added Features

- [internal writes](/docs/sdk/relayers#internal-writes)

### v0.26.1 (June 9, 2023)

#### Source Transaction Id

[OSYm83qQFF5gf4m3BbdZtrHMHjVAMPJcBhfZiJVYjYE](https://sonar.warp.cc/#/app/source/OSYm83qQFF5gf4m3BbdZtrHMHjVAMPJcBhfZiJVYjYE)

#### Added Features

- fix a minor index bug

### v0.26.0 (Mar 21, 2023)

#### Source Transaction Id

[zdP_QTSZ2zO9Nxa1sPAKhyR4geua1_a621_fZm2XPKU](https://sonar.warp.cc/#/app/source/zdP_QTSZ2zO9Nxa1sPAKhyR4geua1_a621_fZm2XPKU)

#### Added Features

- [bundle query](/docs/sdk/queries#bundle)

### v0.25.0 (Mar 10, 2023)

#### Source Transaction Id

[_156pyhqtRr6Zh3KX-Hp4q3-CIrMa2leTqKdu2HpXB8](https://sonar.warp.cc/#/app/source/_156pyhqtRr6Zh3KX-Hp4q3-CIrMa2leTqKdu2HpXB8)

#### Added Features

- built-in Lens Profile authentication

### v0.24.0 (Mar 09, 2023)

#### Source Transaction Id

[fuSpwZIxJtIq3eTdbRgBSwsFYd5f6oMwKB91RR3hXOo](https://sonar.warp.cc/#/app/source/fuSpwZIxJtIq3eTdbRgBSwsFYd5f6oMwKB91RR3hXOo)

#### Added Features

- relay `addAddressLink` with `linkTo`


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

- [setSecure()](/docs/runlocally/repl#deploy-db-in-secure-mode)
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
