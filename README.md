# WeaveDB

![](./assets/cover.png)

## What is WeaveDB?

WeaveDB is a NoSQL database powered by SmartWeave on the Arweave blockchain.

The APIs are a subset (will be a superset) of Firestore from Google but completely decentralized.

- Data is stored on the Arweave permanent storage where anyone can access without permission.
- User authentication (WeaveAuth) is done by pure cryptography using crypto wallets such as MetaMask and ArConnect.
- SmartWeave makes it possible to apply complex computation to stored data for web-centric large-scale dapps just like web2 apps.

## User Authentication

Authentication is done by WeaveAuth, which cryptographically authenticates EVM-based accounts with EIP-712 signatures on SmartWeave contracts.

Other types of crypto accounts will be supported in the future such as Arweave and Polkadot.

The current access control model is rather primitive where only the original creator of a document can conduct write operations to the document. A full set of granular access contols will be implemented soon.

## Demo

A demo dapp is deployed at [weavedb.asteroid.ac](https://weavedb.asteroid.ac).

V0.2 contract is deployed on the Warp testnet at [2NbtdD8IcJUlZ0r8yaiQpQpEfx6NuIAvC8Lrafsn7Ek](https://sonar.warp.cc/?#/app/contract/2NbtdD8IcJUlZ0r8yaiQpQpEfx6NuIAvC8Lrafsn7Ek?network=testnet#) (srcTxId: wSb-Yj2IxLGRomBtXmWnY4ByMrk4mjNp-tmtF9ZYjug).

V0.1 contract is deployed on the Warp testnet at [ltj7QZSNIKbklMmP2b4ypbuUZoN77EQkjFR4Wid2ZIE](https://sonar.warp.cc/?#/app/contract/ltj7QZSNIKbklMmP2b4ypbuUZoN77EQkjFR4Wid2ZIE?network=testnet#).

## Query APIs

WeaveDB is currently a subset of Firestore. So WeaveDB can do most of the things Firestore can do, but with syntactic sugar inspired by [Firestore Sweet](https://warashibe.github.io/firestore-sweet/).

### get

Get a doc

```json
[ "collection_name", "doc_id" ]
```

Get a collection

```json
[ "collection_name" ]
```
Arbitrary length of document nesting is possible.

```json
[ "collection_name", "doc_id", "sub_collection_name_1", "sub_doc_id_1", "sub_collection_name_2", "sub_doc_id_2" ]
```

Limit the number of docs

```json
[ "collection_name", 5 ]
```

Sort

```json
[ "collection_name", [ "age" ] ]
[ "collection_name", [ "age", "desc" ] ]
[ "collection_name", [ "age", "desc" ], [ "name", "asc" ] ]
```

Where

```json
[ "collection_name", [ "age", ">", 20 ] ]
```

`=` `>` `>=` `<` `<=` `!=` `in` `not-in` `array-contains` `array-contains-any` are supported.

Pagination

```json
[ "collection_name", [ "age" ], [ "startAfter", 20 ], [ "endAt", 60 ] ]
[ "collection_name", [ "age" ], [ "name", "desc" ], [ "startAfter", 20, "Bob" ] ]
```

`startAt` `startAfter` `endAt` `endAfter` are supported.


### set

Set a doc

```json
[ { "age": 20, "name": "Bob" }, "collection_name", "doc_id" ]
```
### upsert

Upsert a doc

```json
[ { "age": 20, "name": "Bob" }, "collection_name", "doc_id" ]
```

### update

Update a doc

```json
[ { "age": 25 }, "collection_name", "doc_id" ]
```
Delete a field

```json
[ { "age": { "__op": "del" } }, "collection_name", "doc_id" ]
```

Increase/Decrease a field

```json
[ { "age": { "__op": "inc", "n": 5 } }, "collection_name", "doc_id" ]
```

In the coming SDK, better APIs will be privided for `dec` `inc` operations.

### delete

Delete a doc

```json
[ "collection_name", "doc_id" ]
```

## Deploy Your Own WeaveDB Contracts

Fork the repo.

```bash
git clone https://github.com/asteroid-dao/weavedb.git
cd weavedb
yarn
```

Test.

```bash
yarn test
```
Deploy on the Warp testnet.

```bash
node scripts/generate-wallet testnet
node scripts/add-funds testnet
node scripts/deploy-testnet testnet
```

In the client app, you will need to install `buffer` package and expose it to `window.Buffer` to resolve the Buffer dependency for crypto authentications. This will be removed in future releases.

```bash
yarn add buffer
```

Do the following somehow according to the web framework of your choice.
```js
import { Buffer } from "buffer"
window.Buffer = Buffer
```

## Further References

You can learn everything about Arweave/SmartWeave/Warp at [Warp Academy](https://academy.warp.cc/).
