---
sidebar_position: 3
---
# Query APIs

WeaveDB queries cover most of the things Firestore can do with syntactic sugar inspired by [Firestore Sweet](https://warashibe.github.io/firestore-sweet/).

### getInfo

Get configurations

```js
await db.getInfo()
```

### getNonce

To get the next nonce for an address. Nonces are internally used for signature verification to write data.

```js
await db.getNonce("address")
```

### get / cget

`get` only returns data, whereas `cget` returns metadata of the docs too.

```js
{ id, setter, data, block: { height, timestamp } }
```

The metadata returned with `cget` functions as a cursor for pagination.

Get a doc

```js
await db.get("collection_name", "doc_id")
await db.cget("collection_name", "doc_id")
```

Get a collection

```js
await db.get("collection_name")
await db.cget("collection_name")
```

Arbitrary length of document nesting is possible.

```js
await db.get("collection_name", "doc_id", "sub_collection_name_1", "sub_doc_id_1", "sub_collection_name_2", "sub_doc_id_2")
```

Limit the number of docs

```js
await db.get("collection_name", 5)
```

Sort

```js
await db.get("collection_name", [ "age" ])
await db.get("collection_name", [ "age", "desc" ])
await db.get("collection_name", [ "age", "desc" ], [ "name", "asc" ])
```

Where

```js
await db.get("collection_name", ["age"], [ "age", ">", 20 ])
```

`=` `>` `>=` `<` `<=` `!=` `in` `not-in` `array-contains` `array-contains-any` are supported.

Skip

```js
await db.get("collection_name", [ "age" ], [ "startAfter", 20 ], [ "endAt", 60 ])
await db.get("collection_name", [ "age" ], [ "name", "desc" ], [ "startAfter", 20, "Bob" ])
```

`startAt` `startAfter` `endAt` `endAfter` are supported.

Pagination

```js
const docs_page1 = db.cget("collection_name", [ "age" ])
const docs_page2 = db.cget("collection_name", [ "age" ], ["startAfter", docs_page1[docs_page1.length - 1]])
```

### on / con

You can subscribe to state changes with `on` and `con`. They are the counterparts of `get` and `cget` respectively.

These only work with `weavedb-sdk-node` for now.

```js
const unsubscribe = await on.("collection_name", "doc_id", (data) => {
  console.log(data)
  unsubscribe()
})
```

### getCache / cgetCache

They are the same as `get` / `cget`, but get values from the cached state, which is faster but may not be the most up-to-date values.

These only work with `weavedb-sdk-node` for now.

```js
await db.getCache("collection_name", "doc_id")
await db.cgetCache("collection_name", "doc_id")
```

### listCollections

List collection names

```js
await db.listCollections() // list root collections
await db.listCollections("collection_name", "doc_id") // list sub collections
```

### nocache

With `weavedb-client` and `weavedb-node-client`, if the last argument is boolean, it's recognized as `nocache` option.

gRPC nodes use `getCache` / `cgetCache` to get data by default, but the up-to-date values can be obtained with `nocache` option set `true`.

You would use `nocache` after updating data to get the latest values.

```js
await db.set({ field : "value"}, "collection_name", "doc_id")
await db.get("collection_name", "doc_id", true) // without true, the data might be old
```

### add

Add a doc

```js
await db.add({ "age": 20, "name": "Bob" }, "collection_name")
```
The doc id will be randomly yet deterministically assigned.

### getIds

To get the last added doc id, use `getIds`.

```js
const tx = await db.add({ "age": 20, "name": "Bob" }, "collection_name")
const doc_id = (await db.getIds(tx))[0]
```

### set

Set a doc

```js
await db.set({ "age": 20, "name": "Bob" }, "collection_name", "doc_id")
```

### upsert

Upsert a doc

```js
await db.upsert({ "age": 20, "name": "Bob" }, "collection_name", "doc_id")
```

### update

Update a doc

```js
await db.update({ "age": 25 }, "collection_name", "doc_id")
```
Delete a field

```js
await db.update({ "age": db.del() }, "collection_name", "doc_id")
```

Increase/Decrease a field

```js
await db.update({ "age": db.inc(5) }, "collection_name", "doc_id")
await db.update({ "age": db.inc(-5) }, "collection_name", "doc_id")
```

Array union

```js
await db.update({ "chars": db.union([ "a", "b", "c", "d" ]) }, "collection_name", "doc_id")
```

Array remove

```js
await db.update({ "chars": db.union([ "b", "c" ]) }, "collection_name", "doc_id")
```

Set block timestamp
```js
await db.update({ "date": db.ts() }, "collection_name", "doc_id")
```

Set signer Ethereum address
```js
await db.update({ "address": db.signer() }, "collection_name", "doc_id")
```

### delete

Delete a doc

```js
await db.delete("collection_name", "doc_id")
```

### batch

Atomic batch write

```js
await db.batch([
  ["set", { name: "Bob" }, "people", "Bob"],
  ["upsert", { name: "Alice" }, "people", "Alice"],
  ["delete", "John"]
])
```
