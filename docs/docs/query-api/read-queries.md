---
sidebar_position: 2
---

# Read Queries

:::info
`db` is assumed to be the state variable storing the WeaveDB SDK object.

For references, see [Initialize WeaveDB](/docs/get-started#initialize-weavedb)
:::

## get / cget

`get` only returns data, whereas `cget` returns metadata of the docs too.

```js
{ id, setter, data, block: { height, timestamp } }
```

The metadata returned with `cget` functions as a cursor for pagination.

### Get a doc

```js
await db.get("collection_name", "doc_id")
await db.cget("collection_name", "doc_id")
```

### Get a collection

```js
await db.get("collection_name")
await db.cget("collection_name")
```

### Get a sub collection

Arbitrary length of document nesting is possible.

```js
await db.get("collection_name", "doc_id", "sub_collection_name_1", "sub_doc_id_1", "sub_collection_name_2")
```

### Limit

```js
await db.get("collection_name", 5)
```

### Sort

```js
await db.get("collection_name", [ "age" ])
await db.get("collection_name", [ "age", "desc" ])
await db.get("collection_name", [ "age", "desc" ], [ "name", "asc" ])
```

### Where

```js
await db.get("collection_name", ["age"], [ "age", ">", 20 ])
```

`==` `>` `>=` `<` `<=` `!=` `in` `not-in` `array-contains` `array-contains-any` are supported.

:::info
 Dot notation can be used to specify nested object fields. (e.g. `[ "favorites.food", "==", "apple" ]`)
 
 Note that dot notation only works with `where` for now.
:::

:::caution deprecated
`=` is deprecated and replaced by `==` at `v0.23.0`. You can still use it for backward compatibility.
:::

### Skip

```js
await db.get("collection_name", [ "age" ], [ "startAfter", 20 ], [ "endAt", 60 ])
await db.get("collection_name", [ "age" ], [ "name", "desc" ], [ "startAfter", 20, "Bob" ])
```

`startAt` `startAfter` `endAt` `endAfter` are supported.

### Pagination

```js
const docs_page1 = db.cget("collection_name", [ "age" ])
const docs_page2 = db.cget("collection_name", [ "age" ], ["startAfter", docs_page1[docs_page1.length - 1]])
```
## getNonce

To get the next nonce for an address. Nonces are internally used for signature verification to write data.

```js
await db.getNonce("address")
```

## getIds

To get the last added doc id, use `getIds`.

```js
const tx = await db.add({ "age": 20, "name": "Bob" }, "collection_name")
const doc_id = (await db.getIds(tx))[0]
```

## listCollections

List collection names

```js
await db.listCollections() // list root collections
await db.listCollections("collection_name", "doc_id") // list sub collections
```
<!-- /docs/authentication/auth.md -->
<!-- ## getAddressLink -->

